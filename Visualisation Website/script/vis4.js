// Vis 4: Telehealth Access in Remote Australia
{
    const margin = { top: 40, right: 150, bottom: 60, left: 70 };
    const container = document.getElementById("vis4");
    const containerWidth = container.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    d3.select("#vis4").selectAll("svg").remove();

    const svg = d3.select("#vis4")
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().range([0, width]).padding(0.3);
    const y = d3.scaleLinear().range([height, 0]);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const lineGenerator = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Value))
        .curve(d3.curveMonotoneX);

    // Load data files
    d3.csv("dataset/RemoteTelehealth.csv").then(data => {
        
        // Data processing
        data.forEach(d => {
            d.Value = +d.Value;
        });

        const categories = [...new Set(data.map(d => d["Remoteness Area"]))];
        const methods = [...new Set(data.map(d => d["Access Method"]))];

        const methodSelect = d3.select("#method-select-vis4");
        
        // Clear and populate dropdowns
        methodSelect.selectAll("option").remove();
        methodSelect.selectAll("option")
            .data(methods)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        // Setup axes
        x.domain([...new Set(data.map(d => d.Year))]);
        
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        const yAxisGroup = svg.append("g").attr("class", "y-axis");

        // Legend
        const legend = svg.selectAll(".legend")
            .data(categories)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${width + 20}, ${i * 25})`);

        legend.append("rect").attr("width", 15).attr("height", 15).attr("fill", color);
        legend.append("text").attr("x", 25).attr("y", 12).text(d => d).style("font-size", "12px");

        // Update function
        function update() {
            const selectedMethod = methodSelect.property("value");
            
            // Filter data based on selection
            const formattedData = categories.map(cat => ({
                name: cat,
                values: data.filter(d => d["Access Method"] === selectedMethod && d["Remoteness Area"] === cat)
            }));

            // Update Y domain
            const maxVal = d3.max(data.filter(d => d["Access Method"] === selectedMethod), d => d.Value);
            y.domain([0, (maxVal || 10) * 1.1]).nice();
            yAxisGroup.transition().duration(750).call(d3.axisLeft(y));

            // Draw lines
            const lines = svg.selectAll(".line-path")
                .data(formattedData, d => d.name);

            lines.exit().remove();

            lines.enter()
                .append("path")
                .attr("class", "line-path")
                .attr("fill", "none")
                .attr("stroke-width", 3)
                .merge(lines)
                .transition().duration(750)
                .attr("stroke", d => color(d.name))
                .attr("d", d => lineGenerator(d.values));

            // Draw interaction dots
            const dotGroups = svg.selectAll(".dots-layer")
                .data(formattedData, d => d.name);

            dotGroups.exit().remove();
            const dotGroupsEnter = dotGroups.enter().append("g").attr("class", "dots-layer");

            dotGroupsEnter.merge(dotGroups).selectAll("circle")
                .data(d => d.values)
                .join("circle")
                .attr("r", 6)
                .attr("fill", d => color(d["Remoteness Area"]))
                .on("mouseover", (event, d) => {
                    d3.select("#tooltip").style("opacity", 1)
                        .html(`<strong>${d["Remoteness Area"]}</strong><br>Rate: ${d.Value}%`);
                })
                .on("mousemove", event => {
                    d3.select("#tooltip")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => d3.select("#tooltip").style("opacity", 0))
                .transition().duration(750)
                .attr("cx", d => x(d.Year))
                .attr("cy", d => y(d.Value));
        }

        // Initialize visualization
        update();
        methodSelect.on("change", update);

    }).catch(err => console.error("Error loading CSV:", err));
}