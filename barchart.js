d3.csv("SocialMediaAvg.csv").then(function(data) {
    // Define the dimensions and margins for the SVG
    const margin = { top: 40, right: 30, bottom: 50, left: 70 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Average Likes by Post Type on Social Media Platforms");

    // Create scales
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["Image", "Link", "Video"])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["Image", "Link", "Video"])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add X and Y axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add bars
    const barGroups = svg.selectAll(".group")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    barGroups.selectAll("rect")
        .data(d => ["Image", "Link", "Video"].map(postType => ({
            Platform: d.Platform,
            PostType: postType,
            Likes: data.find(p => p.Platform === d.Platform && p.PostType === postType)?.Likes || 0
        })))
            .enter()
            .append("rect")
            .attr("x", d => x1(d.PostType))
            .attr("y", d => y(d.Likes))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.Likes))
            .attr("fill", d => color(d.PostType));

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 50},${-20})`);

    ["Image", "Link", "Video"].forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

    legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type);
    })});