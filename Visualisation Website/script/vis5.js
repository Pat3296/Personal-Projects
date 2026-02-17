(function () {

    console.log("VIS 5 loaded");

    const margin = { top: 40, right: 40, bottom: 140, left: 70 };
    const width =
        document.getElementById("vis5").clientWidth -
        margin.left -
        margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3
        .select("#vis5")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#tooltip");

    d3.csv("dataset/SharingIntensity.csv").then(rawData => {

        console.log("CSV rows:", rawData.length);

        // Filter valid country rows
        const rows = rawData.filter(d =>
            d.Country &&
            d.Country.trim() !== "" &&
            d.Country !== "OECD" &&
            d.Country !== "European Union"
        );

        // Group by country
        const grouped = d3.group(rows, d => d.Country.trim());

        // Build one record per country with two categories: businesses and government/foreign
        const data = Array.from(grouped, ([country, values]) => {
            const businessRow = values.find(v => /business/i.test(v.Breakdown));
            const govRow = values.find(v => /government bodies/i.test(v.Breakdown) || /foreign governments/i.test(v.Breakdown));
            return {
                country,
                business: businessRow ? +businessRow.Value : 0,
                government: govRow ? +govRow.Value : 0
            };
        }).filter(d => d.country && (d.business || d.government));

        // Compute totals and also store the max single value per country
        data.forEach(d => {
            d.total = d.business + d.government;
            // max single reported value for this country (used for ordering)
            d.value = d3.max([d.business, d.government]);
        });

        // Sort by the largest single reported value (descending) to match previous behaviour
        data.sort((a, b) => b.value - a.value);

        // Stack keys
        const keys = ["business", "government"];

        // Scales
        const x = d3.scaleBand()
            .domain(data.map(d => d.country))
            .range([0, width])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Color palette (vibrant bright blue and orange)
        const color = { business: "#0066FF", government: "#FF8C00" };

        // Create a scale for the sub-groups within each band
        const x1 = d3.scaleBand()
            .domain(keys)
            .range([0, x.bandwidth()])
            .padding(0.1);

        // Axes
        // Create bottom axis and then adjust text positioning
        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Keep tick marks at their original positions, but reposition text labels
        xAxis.selectAll(".tick text")
            .attr("transform", d => `translate(${x.bandwidth() / 2 - 17},0) rotate(-25)`) // shift left by 2px
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .style("font-size", "10px");

        // X-axis label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")

            .text("Country");

        svg.append("g")
            .call(d3.axisLeft(y));

        // Y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .text("Share of datasets (%)");

        // Create groups for each key (business and government)
        const groupedData = keys.map(key => ({
            key,
            values: data.map(d => ({ ...d, key }))
        }));

        // Render each group (business bars, then government bars)
        svg.selectAll("g.group")
            .data(groupedData)
            .enter()
            .append("g")
            .attr("class", "group")
            .attr("fill", (d) => color[d.key])
            .selectAll("rect")
            .data(d => d.values)
            .enter()
            .append("rect")
            .attr("x", d => x(d.country) + x1(d.key))
            .attr("y", d => y(d[d.key]))
            .attr("height", d => height - y(d[d.key]))
            .attr("width", x1.bandwidth())
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(`<strong>${d.country}</strong><br>
                           Business sharing: ${d.business.toFixed(2)}%<br>
                           Government/Foreign sharing: ${d.government.toFixed(2)}%`);
            })
            .on("mousemove", event => {
                tooltip.style("left", event.pageX + 10 + "px")
                       .style("top", event.pageY - 20 + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        // Legend
        const legendData = [
            { key: 'business', label: 'Sharing with businesses' },
            { key: 'government', label: 'Sharing with government/foreign' }
        ];

        const legend = svg.append('g')
            .attr('transform', `translate(${width - 220}, -10)`);

        legend.selectAll('g')
            .data(legendData)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(0, ${i * 18})`)
            .call(g => {
                g.append('rect')
                    .attr('width', 14)
                    .attr('height', 12)
                    .attr('fill', d => color[d.key]);
                g.append('text')
                    .attr('x', 18)
                    .attr('y', 10)
                    .attr('font-size', '12px')
                    .text(d => d.label);
            });

    }).catch(error => {
        console.error("Error loading SharingIntensity.csv:", error);
    });

})();