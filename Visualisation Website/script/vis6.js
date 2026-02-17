// Vis 6: Privacy Concerns – Country Dot Plot
{
    const container = document.getElementById("vis6");
    const width = container.clientWidth || 900;

    const margin = { top: 30, right: 30, bottom: 50, left: 80 };

    // Tooltip
    let tooltip = d3.select("#tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "6px 8px")
            .style("font-size", "12px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }

    d3.csv("dataset/PrivacyConcerns.csv").then(rawData => {

        // Map dropdown values to CSV Breakdown text
        const breakdownMap = {
            "all": "all individuals",
            "18–34": "18–34",
            "18-34": "18-34",
            "35–54": "35–54",
            "35-54": "35-54",
            "55+": "55 or older"
        };

        const normalizeBreakdown = (str) =>
            String(str || "")
                .toLowerCase()
                .replace(/years?/g, "")
                .replace(/[^a-z0-9+]+/g, "") 
                .trim();

        function getFilteredData(ageKey) {
            const breakdownText = breakdownMap[ageKey] || ageKey;

            const target = normalizeBreakdown(breakdownText);

            return rawData
                .filter(d =>
                    d.Breakdown &&
                    normalizeBreakdown(d.Breakdown).includes(target) &&
                    !isNaN(+d.Value)
                )
                .map(d => ({
                    country: d.Country,
                    value: +d.Value
                }))
                .sort((a, b) => b.value - a.value);
        }

        // Build a fixed country order from "all individuals"
        const baseOrder = getFilteredData("all").map(d => d.country);

        function render(ageKey) {
            let data = getFilteredData(ageKey);

            // Keep the same country order across age groups
            data = data.sort((a, b) => {
                const ai = baseOrder.indexOf(a.country);
                const bi = baseOrder.indexOf(b.country);
                return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
            });

            // Calculate average for this age group
            const average = d3.mean(data, d => d.value);

            // Clear previous SVG
            d3.select("#vis6").selectAll("svg").remove();

            // Dynamic height
            const rowHeight = 22;
            const height = data.length * rowHeight + margin.top + margin.bottom;
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            const svg = d3.select("#vis6")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const x = d3.scaleLinear()
                .domain([0, 100])
                .nice()
                .range([0, innerWidth]);

            const y = d3.scaleBand()
                .domain(baseOrder)
                .range([0, innerHeight])
                .padding(0.3);

            svg.append("g")
                .call(d3.axisLeft(y));

            // Add horizontal guide lines for each country
            svg.append("g")
                .attr("class", "country-guides")
                .selectAll("line")
                .data(baseOrder)
                .join("line")
                .attr("x1", 0)
                .attr("x2", innerWidth)
                .attr("y1", d => y(d) + y.bandwidth() / 2)
                .attr("y2", d => y(d) + y.bandwidth() / 2)
                .attr("stroke", "#e5e5e5")
                .attr("stroke-width", 1);

            svg.append("g")
                .attr("transform", `translate(0, ${innerHeight})`)
                .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"));

            // Add average line
            svg.append("line")
                .attr("x1", x(average))
                .attr("x2", x(average))
                .attr("y1", 0)
                .attr("y2", innerHeight)
                .attr("stroke", "#ff6b6b")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");

            // Add average label
            svg.append("text")
                .attr("x", x(average))
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .attr("fill", "#ff6b6b")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .text(`Avg: ${average.toFixed(1)}%`);

            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.value))
                .attr("cy", d => y(d.country) + y.bandwidth() / 2)
                .attr("r", 5)
                .attr("fill", "#4682B4")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 8);
                    tooltip
                        .style("opacity", 1)
                        .html(`<strong>${d.country}</strong><br>${d.value.toFixed(2)}%`);
                })
                .on("mousemove", function (event) {
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 5);
                    tooltip.style("opacity", 0);
                });
        }

        // Initial render
        render("all");

        // Dropdown interaction
        const ageSelect = d3.select("#age-select-vis6");
        if (!ageSelect.empty()) {
            // Populate options
            const options = [
                { value: "all", label: "All individuals" },
                { value: "18–34", label: "18–34" },
                { value: "35–54", label: "35–54" },
                { value: "55+", label: "55 or older" }
            ];

            ageSelect.selectAll("option")
                .data(options)
                .join("option")
                .attr("value", d => d.value)
                .text(d => d.label);

            ageSelect.on("change", function () {
                render(this.value);
            });
        } else {
            console.warn("Vis6: #age-select-vis6 not found in DOM.");
        }

    }).catch(err => console.error("Vis 6 CSV error:", err));
}