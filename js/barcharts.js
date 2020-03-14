/**
 * Created by yevheniia on 13.03.20.
 */
var drawBars = function () {

    const color = d3.scaleOrdinal()
        .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний","Економічний"])
        .range(["#5CE577", "#4A80FF", "#EAEDA0", "#EB6AC2", "purple"]);

    const chartheight = 150;

    //console.log("---------");

    const x = d3.scaleBand()
        .range([0, 150])
        .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний","Економічний"])
        .padding(0.3);

    function chart(selection) {
        selection.each(function (data) {


            var G = d3.select(this);

            //успішні
            const succsess = data.filter(function(c) {
                return c.key === "Успішний"});

            //неуспішні
            const unsuccsess = data.filter(function(c) {
                return c.key === "Неуспішний"
            });

            //заг. сума для конкретного графіка, її будемо рахувати за 100%;
            var totalAmount = 0;

            //максимальне значення для y domain
            var maxValue = 0;


            succsess[0].values.forEach(function(d){
                totalAmount = totalAmount + +d.value;
                maxValue = +d.value > maxValue ? +d.value: maxValue;
           });

            unsuccsess[0].values.forEach(function(d){
                totalAmount = totalAmount + +d.value;
                maxValue = +d.value > maxValue ? +d.value: maxValue;
            });

            //console.log(totalAmount);


            const y = d3.scaleLinear()
                .domain([0, 100])
                .range([150, 0]);

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
                .on("click", function(k){
                   console.log(k.value );
                   console.log(k.value / (totalAmount/100));
                })
                .transition()
                .duration(500)
                .attr('y', function(k) {
                    return y(k.value / (totalAmount/100));
                })
                .attr('height', function(k){
                    return chartheight - y(k.value / (totalAmount/100));
                });



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
                .attr('height', function(k){
                    //return k.values[0].platform_type === "Краудфандинг"? chartheight - y(k.value) : 0;
                    return chartheight - y(k.value / (totalAmount/100));
                });

        });

    }
    return chart;

};