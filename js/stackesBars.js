const color = d3.scaleOrdinal()
    .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний"])
    .range(["#5CE577", "#4A80FF", "#EAEDA0", "#EB6AC2"]);


var startYear = '2016',
    endYear = '2019',
    platform_type = $("#platform_type").children("option:selected").val(),
    value_type = $("#value_type").children("option:selected").val(),
    status_type = $("#status_type").children("option:selected").val(),
    percents_or_absolutes = $("#percents_or_absolutes").children("option:selected").val(),
    platform_or_location = platform_type === "Краудфандинг" ? "platform" : "location",
    favorite = [];



$('#select-all').click(function(event) {
    if(this.checked) {
        // Iterate each checkbox
        $(':checkbox').each(function() {
            this.checked = true;
            favorite = [];
        });
    } else {
        $(':checkbox').each(function() {
            this.checked = false;
            favorite = [];
        });
    }
});


d3.csv("data/data.csv").then(function(csv){
    var platform_list  = [...new Set(csv.filter(function(d){
            return d.platform_type === "Краудфандинг" && d.status  === "Успішний"}).map(function(d) { return d["platform"] }))];

    var location_list =   [...new Set(csv.filter(function(d){
            return d.platform_type != "Краудфандинг" && d.status  === "Успішний"}).map(function(d) { return d["location"] }))];

    //малюємо дефолтні бари
    let default_data = csv.filter(function(d){
        return d.platform_type === "Краудфандинг" &&  d.status === "Успішний" && d.capital != "Економічний" && +d.any_date >= startYear && +d.any_date < endYear   });

    chart(default_data, value_type, percents_or_absolutes, platform_or_location);

    //коли міняємо платформу
    $("#platform_type").on('change', function(){
        favorite = [];
        platform_type = $("#platform_type").children("option:selected").val();
        platform_or_location = platform_type === "Краудфандинг" ? "platform" : "location";

        //прибираємо поле успішні/неуспішні для громадського бюджету
        if(platform_type != "Краудфандинг") {
            $("#status_type").css("display", "none");
            status_type = "Успішний";
        } else {
            $("#status_type").css("display", "inline-block");

        }

        //міняємо чеклист
        change_checkList(platform_or_location);

        //видаляємо таблицю
        d3.select("tbody").remove();
        d3.select("thead").remove();
        d3.selectAll("ul.pagination li").remove();


        //дані НЕ ВКЛЮЧАЮТЬ FAVORITES, бо змінюється платформа
        let dataData = csv.filter(function(d){
            return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && +d.any_date >= startYear && +d.any_date < endYear;
        });
        chart(dataData, value_type, percents_or_absolutes, platform_or_location);
    });

    //коли міняємо інші селекти
    $('.heading-select:not(#platform_type)').on('change', function() {
        value_type = $("#value_type").children("option:selected").val();
        status_type = $("#status_type").children("option:selected").val();
        percents_or_absolutes = $("#percents_or_absolutes").children("option:selected").val();
        //дані ВКЛЮЧАЮТЬ FAVORITES, бо змінюється платформа
        var dataData;
        if(favorite && favorite.length > 0){
            dataData = csv.filter(function(d){
                return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && favorite.includes(d[platform_or_location]) && +d.any_date >= startYear && +d.any_date < endYear
            });
        } else {
            dataData = csv.filter(function(d){
                return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && +d.any_date >= startYear && +d.any_date < endYear
            });
        }

        chart(dataData, value_type, percents_or_absolutes, platform_or_location);
    });


    //намалювати обрані міста/платформи
    $("button#checked-platforms").click(function(){
        $("#select-all").prop( "checked", false );
        favorite = [];

        $.each($("input[name='platform']:checked"), function(){
            favorite.push($(this).val());
            $(this).prop( "checked", false );
        });


        $("#checkboxes").css("display", "none");

        if(favorite.length > 0) {
            let selected_data = csv.filter(function(d){
                return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && favorite.includes(d[platform_or_location]) && +d.any_date >= startYear && +d.any_date < endYear
            });
            chart(selected_data, value_type, percents_or_absolutes, platform_or_location);
        } else {
            $(".selectBox select").addClass("warning");
        }
        console.log("My favourite sports are: " + favorite.join(", "));
    });





    //додати опіції в чекліст - міняємо при переключенні між краудфандінгом і громадським бюджетом
    change_checkList("platform");

    /* функція зміни чеклисту*/
    function change_checkList(value) {
        $("label.platform").remove();
        var select = d3.select("#checkboxes");

        var options = select.selectAll("label")
            .data(value == "platform" ? platform_list : location_list);

        options
            .enter()
            .insert("label", "button")
            .attr("class", "platform")
            .html(function (d) {
                return "<input name='platform' type='checkbox' id='one' value='" + d + "' />" + d + "</label>"
            });
    }

//

    var mySlider = new rSlider({
        target: '#slider',
        values: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
        range: true,
        set: [2012, 2021],
        width:    null,
        scale:    true,
        labels:   true,
        tooltip:  false,
        step:     1,
        disabled: false,
        onChange: function (vals) {
            startYear = vals.split(",")[0];
            endYear = vals.split(",")[1];
            var dataData;
            if(favorite && favorite.length > 0){
                dataData = csv.filter(function(d){
                    return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && favorite.includes(d[platform_or_location]) && +d.any_date >= +startYear && +d.any_date < +endYear
                });
            } else {
                dataData = csv.filter(function(d){
                    return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && +d.any_date >= +startYear && +d.any_date < +endYear
                });
            }

            chart(dataData, value_type, percents_or_absolutes, platform_or_location);
        }
    })


});





/* функція відмальовки */
function chart(data, xValue, scale, yVal) {
    var platforms  = [...new Set(data.map(function(d) { return d[yVal] }))];
    var capitals  = [...new Set(data.map(function(d) { return d.capital }))];
    var all_amounts = [];
    var df = [];


    platforms.forEach(function(platform){
        var cap_df = [];
        ["Інфраструктурний", "Культурний", "Людський", "Соціальний" ].forEach(function(capital){
            var filtered = data.filter(function(d){
                return d[yVal] === platform && d.capital === capital });

            var amount = filtered.reduce(function(a, b) {
                return a + +b[xValue];
            }, 0);

            var ob = { "capital": capital, "amount": amount };
            cap_df.push(ob);
        });

        var total = cap_df.reduce(function(a, b) {
            return a + +b["amount"];
        }, 0);

        var row;
        if(scale === "percents"){
                row = { "platform": platform,
                [cap_df[0].capital]: cap_df[0].amount / (total/100),
                [cap_df[1].capital]: cap_df[1].amount / (total/100),
                [cap_df[2].capital]: cap_df[2].amount / (total/100),
                [cap_df[3].capital]: cap_df[3].amount / (total/100)
            };

            all_amounts.push(100);
        } else {
            row = {
                "platform": platform,
                [cap_df[0].capital]: cap_df[0].amount,
                [cap_df[1].capital]: cap_df[1].amount,
                [cap_df[2].capital]: cap_df[2].amount,
                [cap_df[3].capital]: cap_df[3].amount,
                "total": total
            };
            all_amounts.push(total);
        }

        df.push(row);
    });

    if (scale === "absolutes"){
        df.sort(function(a, b) { return  b.total - a.total });
    } else {
        df.sort(function(a, b) { return  a["Інфраструктурний"] - b["Інфраструктурний"] });
    }


    var subgroups = ["Інфраструктурний", "Культурний", "Людський", "Соціальний" ];

    var svg = d3.select("#chart svg"),
        margin = {top: 50, left: 130, bottom: 50, right: 20},
        width = d3.select("#chart").node().getBoundingClientRect().width,
        height = (platforms.length * 30) + margin.bottom;


    svg.attr("height", height)
        .attr("width", width);

    var y = d3.scaleBand()
        .rangeRound([0, height - margin.bottom])
        .paddingInner(0.2);

    var x = d3.scaleLinear()
        .range([margin.left, width - margin.right]);

    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .attr("class", "x-axis");

    var yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis");

    var groups = d3.map(df, function (d) {
            return (d.platform)
        }).keys();

    y.domain(groups);



    svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y));


    if (scale === "abs") {
        x.domain([0, d3.max(all_amounts, function (d) {
            return d;
        })])
    } else {
        x.domain([0, 100])
    }

    x.domain([0, d3.max(all_amounts, function (d) {
        return d;
    })]);

    svg.select(".x-axis")
        .transition()
        .duration(500)
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2s")));

    var stackedData = d3.stack()
        .keys(subgroups)
        (df);

    var group = svg.selectAll("g.layer")
        .data(stackedData);


    group.exit().remove();

    group.enter()
        .append("g")
        .classed("layer", true)
        .attr("fill", function (d) {
            return color(d.key)
        })
        .attr("capital", function (d) {
            return d.key
        });

    var bars = svg.selectAll("g.layer")
            .selectAll("rect")
            .data(function (d) {
                return d;
            });

    bars.exit().remove();

    bars.enter()
        .append("rect")
        .attr("y", function (d) {
            return y(d.data.platform);
        })
        .attr("x", function (d) {
            return x(0);
        })

        .attr("height", y.bandwidth())
        .merge(bars)
        .on("click", function (d) {
            var clicked_capital = d3.select(this.parentNode).attr("capital");
            var odd_fill = d3.select(this.parentNode).attr("fill");
            console.log(odd_fill);
            var table_data = data.filter(function(p) {
                return p[platform_or_location] === d.data.platform && p.capital === clicked_capital;
            });
            console.log(table_data);
            d3.select(".table-title").html(d.data.platform +". проекти " + clicked_capital.replace("ий", "ого") + "  капіталу");
            drawTable(table_data, xValue, odd_fill)
        })
        .transition()
        .duration(500)
        .attr("y", function (d) {
            return y(d.data.platform);
        })
        .attr("x", function (d) {
            return x(d[0]);
        })
        .attr("width", function (d) {
            return x(d[1]) - x(d[0]);
        });
}