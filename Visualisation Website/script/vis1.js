// Vis 1: Telehealth Consultations Over Time (Country Selector)

const margin = { top: 40, right: 120, bottom: 60, left: 70 };
const containerWidth = document.getElementById("vis1").clientWidth;
const width = containerWidth - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#vis1")
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load CSV
d3.csv("dataset/HealthcareUtilisation.csv").then(data => {

    // Convert strings to numbers
    data.forEach(d => {
        d.TIME_PERIOD = +d.TIME_PERIOD;
        d.OBS_VALUE = +d.OBS_VALUE;
    });

    // Keep only valid rows
    // Filter for the requested 2019-2024 range
    const cleanData = data.filter(d => 
        !isNaN(d.OBS_VALUE) && 
        d.TIME_PERIOD >= 2019 && 
        d.TIME_PERIOD <= 2024
    );

    // DEDUPLICATION: Ensure only one value per year/type for each country
    // (This fixes the repeating years issue caused by duplicate rows in the CSV)
    const uniqueMap = new Map();
    cleanData.forEach(d => {
        const key = `${d.REF_AREA}-${d["Consultation type"]}-${d.TIME_PERIOD}`;
        if (!uniqueMap.has(key) || d.OBS_VALUE > uniqueMap.get(key).OBS_VALUE) {
            uniqueMap.set(key, d);
        }
    });
    const processedData = Array.from(uniqueMap.values());

    // Get unique countries
    const countries = [...new Set(processedData.map(d => d.REF_AREA))];

    // Populate dropdown
    const select = d3.select("#country-select");

    select.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    // Default country
    select.property("value", "AUS");

    // Scales
    // Use scaleLinear but with tickValues to prevent any repeats
    const xScale = d3.scaleLinear().domain([2019, 2024]).range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    // Color Scale for the two lines
    const colorScale = d3.scaleOrdinal()
        .domain(["Teleconsultations", "In-person"])
        .range(["#2b3e50", "#e67e22"]);

    // Axes
    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`);

    const yAxis = svg.append("g");

    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Consultations per person");

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.TIME_PERIOD))
        .y(d => yScale(d.OBS_VALUE));

    // Path
    // Telehealth Path (Navy)
    const path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", colorScale("Teleconsultations"))
        .attr("stroke-width", 2.5);

    // In-person Path (Orange)
    const pathInPerson = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", colorScale("In-person"))
        .attr("stroke-width", 2.5);

    // Tooltip
    const tooltip = d3.select("#tooltip");

    // Group for data points
    const pointsGroup = svg.append("g");

    // Update function
    function update(country) {

        const countryData = processedData
            .filter(d => d.REF_AREA === country)
            .sort((a, b) => a.TIME_PERIOD - b.TIME_PERIOD);
        
        const telehealthData = countryData.filter(d => d["Consultation type"] === "Teleconsultations");
        const inPersonData = countryData.filter(d => d["Consultation type"] === "In-person");

        // Set Y domain based on country data
        yScale.domain([0, d3.max(countryData, d => d.OBS_VALUE)]).nice();

        // FIX REPEATING YEARS: Explicitly define the years we want to see
        xAxis.transition().duration(750).call(
            d3.axisBottom(xScale)
              .tickValues([2019, 2020, 2021, 2022, 2023, 2024])
              .tickFormat(d3.format("d"))
        );
        
        yAxis.transition().duration(750).call(d3.axisLeft(yScale));

        // Update line
        path
            .datum(telehealthData)
            .transition()
            .duration(750)
            .attr("d", line);

        pathInPerson
            .datum(inPersonData)
            .transition()
            .duration(750)
            .attr("d", line);

        // Update points
        const circles = pointsGroup.selectAll("circle")
            .data(countryData, d => d.TIME_PERIOD + d["Consultation type"]);

        circles.exit().remove();

        circles
            .enter()
            .append("circle")
            .merge(circles)
            .transition()
            .duration(750)
            .attr("r", 4)
            .attr("fill", d => colorScale(d["Consultation type"]))
            .attr("cx", d => xScale(d.TIME_PERIOD))
            .attr("cy", d => yScale(d.OBS_VALUE));

        // Tooltip logic
        pointsGroup.selectAll("circle")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(`
                        <strong>${d["Consultation type"]}</strong><br>
                        Year: ${d.TIME_PERIOD}<br>
                        Value: ${d.OBS_VALUE.toFixed(2)}
                    `);
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    }

    // Initial render
    update("AUS");

    // Dropdown interaction
    select.on("change", function () {
        update(this.value);
    });

});