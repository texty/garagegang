const color = d3.scaleOrdinal()
    .domain(["Культурний", "Соціальний", "Людський", "Інфраструктурний"])
    .range(["#EB6AC2", "#5CE577", "#EAEDA0", "#4A80FF"]);

var startYear = '2016',
    endYear = '2021',

    //значення селектів в заголовку
    platform_type = $("#platform_type").children("option:selected").val(),
    value_type = $("#value_type").children("option:selected").val(),
    status_type = $("#status_type").children("option:selected").val(),
    percents_or_absolutes = $("#percents_or_absolutes").children("option:selected").val(),
    platform_or_location = platform_type === "Краудфандинг" ? "platform" : "location",

    //значення додані до фільтру
    favorite = [],

    mySlider,

    //змінні для відмальовки таблиці
    table_data,
    odd_fill,
    clicked_capital,
    istable = false;



//select-all та unselect-all у фільтру платформ ліворуч від графіка
$('#select-all').click(function(e) {
    if(this.checked) {
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


d3.csv("data/data_october_21.csv").then(function(csv){

      csv.forEach(function(d){
        d.year = d.start_date.substring(0,4);
    }) 

    //перелік унікальних назв платформ
    var platform_list  = [...new Set(csv.filter(function(d){        
        return d.platform_type === "Краудфандинг" && d.status  === "Успішний"}).map(function(d) { return d["platform"] }))];

    //перелік унікальних назв міст
    var location_list =   [...new Set(csv.filter(function(d){
            return d.platform_type != "Краудфандинг" && d.status  === "Успішний"}).map(function(d) { return d["location"] }))];

    //малюємо дефолтні бари
    let default_data = csv.filter(function(d){
        return d.platform_type === "Краудфандинг" &&  d.status === "Успішний" && d.capital != "Економічний" && +d.year >= startYear && +d.year < endYear   });

    console.table(default_data)    
    chart(default_data, value_type, percents_or_absolutes, platform_or_location);


    /* -----SELECTS ON CHANGE  ------- */

    //коли міняємо платформу
    $("#platform_type").on('change', function(){
        $('#status_type option[value=Успішний]').prop('selected', true);
        status_type = "Успішний";
        //не показувати таблицю, бо ще нічого не клікнуто
        istable = false;

        //обраних у фільтрі знову немає, все перемалювалось
        favorite = [];

        //змінюємо значення змінної platform_type і platform_or_location змінюється відповідно до неї
        platform_type = $("#platform_type").children("option:selected").val();
        platform_or_location = platform_type === "Краудфандинг" ? "platform" : "location";

        //прибираємо поле успішні/неуспішні для громадського бюджету, міняємо years range на слайдері
        if(platform_type != "Краудфандинг") {
            $("#status_type").css("display", "none");
            mySlider.destroy();
            createSlider(2016, 2021);
        } else {
            $("#status_type").css("display", "inline-block");
            mySlider.destroy();
            createSlider(2012, 2021);

        }
        change_checkList(platform_or_location);
        
        removeTable();

        //дані НЕ ВКЛЮЧАЮТЬ FAVORITES, бо змінюється платформа
        let dataData = csv.filter(function(d){
            return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && +d.year >= startYear && +d.year < endYear;
        });
        chart(dataData, value_type, percents_or_absolutes, platform_or_location);
    });


    //коли міняємо інші селекти
    $('.heading-select:not(#platform_type)').on('change', function() {

        //перевизначаємо змінні
        value_type = $("#value_type").children("option:selected").val();
        status_type = $("#status_type").children("option:selected").val();
        percents_or_absolutes = $("#percents_or_absolutes").children("option:selected").val();

       //дані ВКЛЮЧАЮТЬ FAVORITES, тобто можна дивиитись інші параметри для вже обраних міст/платформ
        var dataData;
        if(favorite && favorite.length > 0){
            dataData = csv.filter(function(d){
                return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && favorite.includes(d[platform_or_location]) && +d.year >= startYear && +d.year < endYear
            });
        } else {
            dataData = csv.filter(function(d){
                return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && +d.year >= startYear && +d.year < endYear
            });
        }

        chart(dataData, value_type, percents_or_absolutes, platform_or_location);
    });



    //якщо переключаємо успішні/неуспішні проекти, таблицю видаляємо, бо змінились проекти
    $('#status_type').on('change', function() {
        status_type = $("#status_type").children("option:selected").val();
        removeTable();
    });

    /* ----- FILTER ON CHANGE  ------- */
    //реакція на фільтр, малюємо обрані обрані міста/платформи
    $("button#checked-platforms").click(function(){
        removeTable();

        $("#select-all").prop( "checked", false );
        favorite = [];

        $.each($("input[name='platform']:checked"), function(){
            favorite.push($(this).val());
            $(this).prop( "checked", false );
        });

        $("#checkboxes").css("display", "none");

        if(favorite.length > 0) {
            let selected_data = csv.filter(function(d){
                return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний" && favorite.includes(d[platform_or_location]) && +d.year >= startYear && +d.year < endYear
            });
            chart(selected_data, value_type, percents_or_absolutes, platform_or_location);
        } else {
            $(".selectBox select").addClass("warning");
        }
        // console.log("My favourite sports are: " + favorite.join(", "));
    });


    //додати опіції в чекліст - міняємо при переключенні між краудфандінгом і громадським бюджетом
    change_checkList("platform");

    /* функція зміни чеклисту*/
    function change_checkList(value) {
        $("label.platform").remove();
        var checkList = value == "platform" ? platform_list : location_list;

        checkList.sort(function(a,b) { return d3.ascending(a, b)});

        for(var li in checkList){
            $("#checkboxes").append("<label class='platform'><input name='platform' type='checkbox' id='one' value='" + checkList[li] + "' />" + checkList[li] + "</label>")
        }
    }

    
    /* ----- SLIDER  ------ */
    createSlider(2012, 2021);

    function createSlider(minValue, maxValue) {
        mySlider = new rSlider({
            target: '#slider',
            values: {min: minValue, max: maxValue},
            range: true,
            set: [minValue, maxValue],
            width: null,
            scale: true,
            labels: true,
            tooltip: false,
            step: 1,
            disabled: false,
            onChange: function (vals) {
                startYear = vals.split(",")[0];
                endYear = vals.split(",")[1];
                var dataData;
                if (favorite && favorite.length > 0) {
                    dataData = csv.filter(function (d) {
                        return d.platform_type === platform_type && d.status === status_type && d.capital != "Економічний" && favorite.includes(d[platform_or_location]) && +d.year >= +startYear && +d.year < +endYear
                    });
                } else {
                    dataData = csv.filter(function (d) {
                        return d.platform_type === platform_type && d.status === status_type && d.capital != "Економічний" && +d.year >= +startYear && +d.year < +endYear
                    });
                }

                //видаляємо таблицю
                removeTable();

                //малюємо новий графік
                chart(dataData, value_type, percents_or_absolutes, platform_or_location);
            }
        });
    }
});



/* функція відмальовки */
function chart(data, xValue, scale, yVal) {
    var platforms  = [...new Set(data.map(function(d) { return d[yVal] }))];
    var capitals  = [...new Set(data.map(function(d) { return d.capital }))];



    //сюди пушимо загальні значення по кожній платформі, щоб потім порахувати d3.max для x-axis
    var all_amounts = [];

    //сюди пушимо кожен рядок підготованих даних для stacked bar
    var df = [];

    //reshape data for stacked bar format
    platforms.forEach(function(platform){
        //сюди будемо пушити значення для всіх капіталів по поточній платформі:
        var cap_df = [];

        //проходимось по кожному капіталу:
        ["Інфраструктурний", "Культурний", "Людський", "Соціальний" ].forEach(function(capital){
            //фільтруємо дані по платформі і капіталу, наприклад, всі інфраструктурні проекти по Київу
            var filtered = data.filter(function(d){
                return d[yVal] === platform && d.capital === capital });

            //загальна сума бюджету, або к-ть голосів по платформі і капіталу
            var amount = filtered.reduce(function(a, b) {
                return a + +b[xValue];
            }, 0);

            console.log(amount);

            //створюємо частину майбутнього рядку: к-ть голосів або бюджет по поточному капіталу
            var ob = { "capital": capital, "amount": amount };

            //пушиму значення у cap_df
            cap_df.push(ob);
        });

        //рахуємо загальну кількість бюджету або голосів, щоб порахувати відсотки для кожного капіталу
        var total = cap_df.reduce(function(a, b) {
            return a + +b["amount"];
        }, 0);

        //створюємо один рядок даних із cap_df, він різний для шкали з відсотками та шкали абсолютних значень.
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


    //сортуємо дані (щоб від більшої абсолютної цифри для абсолютних цифр
    if (scale === "absolutes"){
        df.sort(function(a, b) { return  b.total - a.total });
    } else {
        df.sort(function(a, b) { return  a["Інфраструктурний"] - b["Інфраструктурний"] });
    }

    var subgroups = ["Інфраструктурний", "Культурний", "Людський", "Соціальний" ];

    var svg = d3.select("#chart svg"),
        margin = {top: 50, left: 130, bottom: 50, right: 20},
        width = d3.select("#chart").node().getBoundingClientRect().width,
        height = (platforms.length * 30) + margin.bottom; //плаваюча, залежно від кількості платформ

    svg.attr("height", height)
        .attr("width", width);

    var y = d3.scaleBand()
        .rangeRound([0, height - margin.bottom])
        .paddingInner(0.2);

    var x = d3.scaleLinear()
        .range([margin.left, width - margin.right]);

    svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .attr("class", "x-axis");

    svg.append("g")
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


    //різний x.domain для відсотків та цифр
    if (scale === "absolutes") {
        x.domain([0, d3.max(all_amounts, function (d) {
            return d;
        })])
    } else {
        x.domain([0, 100])
    }

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
        .attr("fill", function (d) { return color(d.key) })
        .attr("capital", function (d) { return d.key });

    var bars = svg.selectAll("g.layer")
            .selectAll("rect")
            .data(function (d) { return d; });

    bars.exit().remove();

    bars.enter()
        .append("rect")
        .attr("y", function (d) {  return y(d.data.platform); })
        .attr("x", function (d) { return x(0); })
        .attr("height", y.bandwidth())
        .merge(bars)
        .on("click", function (d) {
            //додаємо обводку до клікнутого прямокутника
            d3.selectAll("svg rect").attr("stroke",  "white").attr("stroke-width", "0");
            d3.select(this).attr("stroke",  "white").attr("stroke-width", "2px");
            $(".hint").css("display", "none");

            //замінюємо потрібні для табличці змінні
            istable = true;
            clicked_capital = d3.select(this.parentNode).attr("capital");
            odd_fill = d3.select(this.parentNode).attr("fill");

            //малюємо табличку
            table_data = data.filter(function(p) { return p[platform_or_location] === d.data.platform && p.capital === clicked_capital;  });
            d3.select(".table-title").html(d.data.platform + ". проєкти " + clicked_capital.replace("ий", "ого") + "</span>  капіталу. " + startYear +" - " + (endYear-1));
            drawTable(table_data, value_type, odd_fill);
        })
        .transition().duration(500)
        .attr("y", function (d) { return y(d.data.platform); })
        .attr("x", function (d) {
            console.log(d);
            return x(d[0]);
        })
        .attr("width", function (d) { return x(d[1]) - x(d[0]);  });
}


function removeTable() {
    //видаляємо таблицю
    d3.select("tbody").remove();
    //d3.select("thead").remove();
    d3.select(".table-title").html("");
    d3.selectAll("ul.pagination li").remove();
    $(".hint").css("display", "block");
    $("svg rect").attr("stroke-width", 0);
}