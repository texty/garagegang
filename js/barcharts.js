/**
 * Created by yevheniia on 13.03.20.
 */
var drawBars = function () {

    const color = d3.scaleOrdinal()
        .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний","Економічний"])
        .range(["#5CE577", "purple", "#EAEDA0", "#EB6AC2", "#4A80FF"]);

    const chartheight = 150;

    const y = d3.scaleLinear()
        .domain([-150, 150])
        .range([150, 0]);

    const x = d3.scaleBand()
        .range([0, 150])
        .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний","Економічний"])
        .padding(0.3);

    function chart(selection) {
        selection.each(function (data) {
      
            var G = d3.select(this);

            const succsess = data.filter(function(c) {
                return c.key === "Успішний"});

            const unsuccsess = data.filter(function(c) {
                return c.key === "Неуспішний"
            });

            const positive_bars = G.selectAll(".positive-bar")
                .data(succsess[0].values);

            const negative_bars = G.selectAll(".negative-bar")
                .data(unsuccsess[0].values);

            positive_bars.enter()
                .append("rect")
                .attr("class", "positive-bar")
                .attr("width", x.bandwidth())
                .attr("x", function(d) {
                    return x(d.key)
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("fill", function(d) {
                    return color(d.key)
                })
                .attr("y", chartheight)
                .transition()
                .duration(500)
                .attr('y', function(k) {
                    return y(k.values.length);
                })
                .attr('height', function(k,i){ return chartheight - y(k.values.length); });


            negative_bars.enter()
                .append("rect")
                .attr("class", "negative-bar")
                .attr("width", x.bandwidth())
                .attr("x", function(d) {
                    return x(d.key)
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("fill", function(d) { return color(d.key) })
                .attr("y", chartheight)
                .transition()
                .duration(500)
                .attr('y', chartheight + 20 )
                .attr('height', function(k){ return k.values[0].platform_type === "Краудфандинг"? chartheight - y(k.values.length) : 0; });

        });

    }

    return chart;

};