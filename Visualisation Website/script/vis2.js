// Vis 2: ICT Access by Household (Yearly Bar Chart)

{
    // Matching Vis 1 margins exactly
    const margin = { top: 40, right: 120, bottom: 60, left: 70 };
    const container = document.getElementById("vis2");
    
    const containerWidth = container.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear existing SVG
    d3.select("#vis2").selectAll("svg").remove();

    // Create SVG
    const svg = d3.select("#vis2")
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load CSV with cache buster to ensure data updates reflect immediately
    d3.csv("dataset/ICTAccessbyHousehold.csv?v=" + new Date().getTime()).then(data => {
        
        // Convert strings to numbers and map fields
        data.forEach(d => {
            d.OBS_VALUE = +d.OBS_VALUE;
            d.TIME_PERIOD = +d.TIME_PERIOD;
            d.countryName = d["Reference area"]; 
            d.countryCode = d["REF_AREA"];
        });

        // Keep valid rows
        const processedData = data.filter(d => !isNaN(d.OBS_VALUE) && d.countryName);

        // Populate year dropdown
        const years = [...new Set(processedData.map(d => d.TIME_PERIOD))].sort((a, b) => b - a);
        const select = d3.select("#year-select-vis2");

        select.selectAll("option")
            .data(years)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        // Scales
        const xScale = d3.scaleBand().range([0, width]).padding(0.3);
        const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

        // Axes groups
        const xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);
        const yAxisGroup = svg.append("g");

        // Axis labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 45) // Matching Vis 1 "Year" label position
            .attr("text-anchor", "middle")
            .text("Country");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .text("Households with Access (%)");

        // Average line elements
        const avgLine = svg.append("line")
            .attr("stroke", "#7f8c8d")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("x1", 0)
            .attr("x2", width);

        const avgLabel = svg.append("text")
            .attr("x", width + 5)
            .attr("fill", "#7f8c8d")
            .attr("font-size", "10px")
            .attr("font-weight", "bold");

        // Tooltip selection
        const tooltip = d3.select("#tooltip");

        // Update function for interactivity
        function update(selectedYear) {
            
            // Filter and sort data by value for visual clarity
            const yearData = processedData
                .filter(d => d.TIME_PERIOD == selectedYear)
                .sort((a, b) => b.OBS_VALUE - a.OBS_VALUE);

            // Calculate metrics for highlights and average
            const maxVal = d3.max(yearData, d => d.OBS_VALUE);
            const minVal = d3.min(yearData, d => d.OBS_VALUE);
            const avgVal = d3.mean(yearData, d => d.OBS_VALUE);

            // Update X domain based on available countries
            xScale.domain(yearData.map(d => d.countryName));

            // Axis transitions
            xAxisGroup.transition().duration(750)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "rotate(-25)")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .style("font-size", "10px");
            
            yAxisGroup.transition().duration(750).call(d3.axisLeft(yScale));

            // Update average line and label position
            avgLine.transition().duration(750)
                .attr("y1", yScale(avgVal))
                .attr("y2", yScale(avgVal));

            avgLabel.transition().duration(750)
                .attr("y", yScale(avgVal) + 4)
                .text(`AVG: ${avgVal.toFixed(1)}%`);

            // Bar data binding
            const bars = svg.selectAll(".bar")
                .data(yearData, d => `${d.countryCode}-${d.TIME_PERIOD}`);

            // Remove old bars
            bars.exit().remove();

            // Create new bars
            const barsEnter = bars.enter()
                .append("rect")
                .attr("class", "bar");

            // Merge and animate bars
            barsEnter.merge(bars)
                .on("mouseover", (event, d) => {
                    d3.select(event.currentTarget).attr("opacity", 0.7);
                    tooltip.style("opacity", 1)
                        .html(`<strong>${d.countryName}</strong><br>Access: ${d.OBS_VALUE.toFixed(2)}%`);
                })
                .on("mousemove", event => {
                    tooltip.style("left", (event.pageX + 10) + "px")
                           .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", (event) => {
                    d3.select(event.currentTarget).attr("opacity", 1);
                    tooltip.style("opacity", 0);
                })
                .transition().duration(750)
                .attr("x", d => xScale(d.countryName))
                .attr("y", d => yScale(d.OBS_VALUE))
                .attr("width", xScale.bandwidth())
                .attr("height", d => height - yScale(d.OBS_VALUE))
                .attr("fill", d => {
                    if (d.OBS_VALUE === maxVal) return "#27ae60"; // Highlight highest
                    if (d.OBS_VALUE === minVal) return "#c0392b"; // Highlight lowest
                    return "#2b3e50"; // Default navy color
                });
        }

        // Initial render
        update(years[0]);

        // Dropdown interaction
        select.on("change", function() {
            update(this.value);
        });

    }).catch(err => console.error("Error loading CSV:", err));
}