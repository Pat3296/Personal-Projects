// Vis 3: Medicare Telehealth Services by Australian State (Choropleth)
{
    const margin = { top: 40, right: 120, bottom: 60, left: 70 };
    const container = document.getElementById("vis3");
    const containerWidth = container.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const itemDescriptions = {
        "91891": "Phone Consultation (Level B: 6-19 mins)",
        "91801": "Video Consultation (Level C: 20-39 mins)",
        "91900": "Phone Consultation (Level C: 20+ mins - MyMedicare)"
    };

    const stateMapLookup = {
        "1": "NSW", "2": "VIC", "3": "QLD", "4": "SA", 
        "5": "WA", "6": "TAS", "7": "NT", "8": "ACT"
    };

    d3.select("#vis3").selectAll("svg").remove();

    const svg = d3.select("#vis3")
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);
    const colorScale = d3.scaleSequential(d3.interpolateBlues);

    // Load data files
    Promise.all([
        d3.json("dataset/AusJson.json"), 
        d3.csv("dataset/MBSData.csv")
    ]).then(([geoData, csvData]) => {
        
        // Data processing
        csvData.forEach(d => {
            d.Services = +d.Services || 0;
            d.YearValue = +d["Calendar Year"]; 
        });

        projection.fitSize([width, height], geoData);

        // Extract unique values for dropdowns
        const years = [...new Set(csvData.map(d => d.YearValue))]
            .filter(d => d && !isNaN(d))
            .sort((a, b) => b - a);

        const items = [...new Set(csvData.map(d => d.Item))].filter(d => d).sort();

        const yearSelect = d3.select("#year-select-vis3");
        const itemSelect = d3.select("#item-select-vis3");

        // Clear and populate dropdowns
        yearSelect.selectAll("option").remove();
        itemSelect.selectAll("option").remove();

        yearSelect.selectAll("option")
            .data(years)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        itemSelect.selectAll("option")
            .data(items)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        const tooltip = d3.select("#tooltip");
        const itemNote = svg.append("text")
            .attr("x", 0).attr("y", -10).attr("font-size", "14px")
            .attr("font-weight", "600").attr("fill", "#2b3e50");

        // Update function
        function update() {
            const selectedYear = +yearSelect.property("value");
            const selectedItem = itemSelect.property("value");

            itemNote.text(`Mode: ${itemDescriptions[selectedItem] || "Telehealth Services"}`);

            // Filter data based on selection
            const filteredData = csvData.filter(d => d.YearValue === selectedYear && d.Item === selectedItem);
            const dataMap = new Map(filteredData.map(d => [d.State, d.Services]));

            const maxServices = d3.max(filteredData, d => d.Services) || 1;
            colorScale.domain([0, maxServices]);

            // Draw map paths
            const states = svg.selectAll(".state")
                .data(geoData.features);

            states.enter()
                .append("path")
                .attr("class", "state")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)
                .merge(states)
                .on("mouseover", (event, d) => {
                    const code = d.properties.STATE_CODE;
                    const abbr = stateMapLookup[code];
                    const val = dataMap.get(abbr) || 0;

                    d3.select(event.currentTarget).attr("stroke", "#e67e22").attr("stroke-width", 2);
                    
                    tooltip.style("opacity", 1)
                        .html(`<strong>${d.properties.STATE_NAME}</strong><br>Services: ${val.toLocaleString()}`);
                })
                .on("mousemove", event => {
                    tooltip.style("left", (event.pageX + 10) + "px")
                           .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", (event) => {
                    d3.select(event.currentTarget).attr("stroke", "#fff").attr("stroke-width", 1);
                    tooltip.style("opacity", 0);
                })
                .transition().duration(750)
                .attr("d", path)
                .attr("fill", d => {
                    const code = d.properties.STATE_CODE;
                    const abbr = stateMapLookup[code];
                    const val = dataMap.get(abbr);
                    return val ? colorScale(val) : "#f0f0f0";
                });
        }

        // Initialize visualization
        update();
        yearSelect.on("change", update);
        itemSelect.on("change", update);

    }).catch(err => console.error("Error:", err));
}