// Load the data
const socialMedia = d3.csv("socialMedia.csv");

socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
        d.value = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400, margin = { top: 40, right: 30, bottom: 40, left: 40 };
    
    // Create the SVG container
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
        .range([height - margin.bottom, margin.top]);
    
    // Add scales
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Add labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Social Media Platform");

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Likes");


    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Like Distribution by Platform");

    // Calculate Quartiles
    // Min and Max are just the minimum and maximum values in the data
    // Median is the middle value, q1 and q3 are such that 25% and 75% of the
    // data lie below each, respectively
    function rollupFunction(values) {
        values.sort((a, b) => a.Likes - b.Likes);
        const q1 = d3.quantile(values.map(d => d.Likes), 0.25);
        const median = d3.quantile(values.map(d => d.Likes), 0.5);
        const q3 = d3.quantile(values.map(d => d.Likes), 0.75);
        const min = d3.min(values, d => d.Likes);
        const max = d3.max(values, d => d.Likes);
        return { q1, median, q3, min, max };
    }

    // Group data by platform and compute quartiles for each platform
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Platform);

    // For each group, calculate where to draw each of the lines in the boxplot
    quartilesBySpecies.forEach((quartiles, Platform) => {
        // Define the X position for each of the categories and the box widths
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth();
        
        // Draw vertical lines from min to max
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.min))
            .attr("y2", yScale(quartiles.max))
            .attr("stroke", "black");
        
        // Draw box from q1 to q3
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("fill", "lightgray")
            .attr("stroke", "black");
        
        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black");
    });
});
