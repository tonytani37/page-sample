    // ブラウザが開かれたら動くやつ
    // window.onload = function(){
    // 東京都公開のjsonデータを取得する
    let requestURL ='https://raw.githubusercontent.com/tokyo-metropolitan-gov/covid19/development/data/daily_positive_detail.json';
    let request = new XMLHttpRequest(); // webからデータ受信するためのインスタンス作成。pythonみたいに外部ライブラリをimportしなくていいのは楽

    request.open('GET', requestURL); // 第一引数はデータを受け取るのでGETでよい　第二引数はデータ取得先のURL　XMLHttpRequestは非同期リクエスト

    request.responseType = 'json'; //　とってくるデータはjsonだと教えてやる
    request.send();  // 受信実行？

    // requestに入ってるjsonをresponseで取り出して変数tokyotownにセットしたのち、
    // get_weekly_gain_ratio関数で必要な要素を抽出し、draw_graph関数でグラフを描く
    request.onload = function() {
        // データを取得する
        const tokyotown = request.response;
        // 戻り値が配列の場合、配列内に変数を指定して受け取ることができるみたい
        let [tokyo_yymmdd,tokyo_weekly,tokyo_count,tokyo_average] = get_json_data(tokyotown);

        var DAYS = 365; //グラフの対象日数を指定。最新から何日前にするか(-DAYS)でスライスする

        // データ(str)のスライスはstr.slice(a,b) aは開始、bは終了のindexを指定　どちらも省略可能
        // 特定の要素を指定したい場合にはstr[i]とする。最後の要素指定は [str.length - 1]
        // indexはもちろん0から始まる　
        // console.log(tokyo_weekly[tokyo_weekly.length - 1])
        draw_graph(tokyo_yymmdd.slice(-DAYS)
        ,tokyo_weekly.slice(-DAYS)
        ,tokyo_count.slice(-DAYS)
        ,tokyo_average.slice(-DAYS)
        );
    }
    

    // function draw_graph_r(tokyo_yymmdd.slice(-DAYS)
    //     ,tokyo_weekly.slice(-DAYS)
    //     ,tokyo_count.slice(-DAYS)
    //     ,tokyo_average.slice(-DAYS)
    //     )
    // }

// グラフ化対象データを抜き取る
    function get_json_data(jsonObj) {
        let tokyo_data = jsonObj['data'];
        let tokyo_weekly = []; // 前週比感染率
        let tokyo_yymmdd = []; // データ日付
        let tokyo_count = []; // 感染者数
        let tokyo_average = []; // 感染者移動平均
        // let tokyo_weekly_w = []
        // jsonデータをforで回して、抜きたい項目ごとに配列を作成する
        for  (let i = 0; i < tokyo_data.length; i++) {
            tokyo_yymmdd.push(tokyo_data[i]["diagnosed_date"])
            // 以下３行のコメントは、二次元の配列を作ろうとしたときの名残
            // tokyo_weekly_w.push(tokyo_data[i]['weekly_gain_ratio'])
            // tokyo_weekly.push(tokyo_weekly_w)
            // tokyo_weekly_w = []
            tokyo_weekly.push(tokyo_data[i]["weekly_gain_ratio"])
            tokyo_count.push(tokyo_data[i]['count'])
            tokyo_average.push(tokyo_data[i]['weekly_average_count'])
        }
        // 関数からの戻り値が複数ある場合には、配列にして返すべし
        return [tokyo_yymmdd,tokyo_weekly,tokyo_count,tokyo_average];
    }


//　グラフを描く(chart.jsを利用)
    function draw_graph(tokyo_yymmdd,tokyo_weekly,tokyo_count,tokyo_average) {
        var canvas = document.getElementById("myLineChart");
        // canvas.width=window.innerWidth*0.3;
        // canvas.height=window.innerHeight*0.3;
        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;

        // let start_value = tokyo_yymmdd[0];
        // let end_value = tokyo_yymmdd[tokyo_yymmdd.length - 1];
        // console.log(start_value);
        // console.log(end_value);

        let max_count = tokyo_count.reduce(function(a,b){ // javascriptは配列から最大値をとってくるのがめんどくさい
            return Math.max(a,b);
          });
        let max_ratio = tokyo_weekly.reduce(function(a,b){
        return Math.max(a,b);
        });

        var ctx = canvas.getContext('2d');
         var myLineChart = new Chart(ctx, {
            type: 'bar', //　ここはbarにしないと全部が表示されない
            data: {
                labels: tokyo_yymmdd, // jsonから抜きだした日付の配列
                datasets: [
                // 折れ線グラフ
                {
                    label: '感染者移動平均',
                    type:'line', // 折れ線グラフの指定
                    data: tokyo_average, // jsonから抜き出した感染者移動平均の配列
                    borderColor : "darkred", // グラフの枠線色指定
                    // backgroundColor : "rgba(254,97,132,0.2)",
                    backgroundColor : "rgba(255,0,0,0.1)", // グラフの塗りつぶし色指定 折れ線グラフの場合、グラフ線以下が塗りつぶされる rgbaのaは不透明度(1:塗りつぶし,0:透明)
                    },
                // 棒グラフ
                {
                    label: '感染者数',
                    type:'bar', // 棒グラフの指定
                    data: tokyo_count, // jsonから抜き出した感染者数の配列
                    //   borderColor: "rgba(255,0,0,1)",
                    borderColor: "gray",
                    backgroundColor: "gray",
                    },
                 ],
             },
             options: {
                title: {
                    display: true,
                    text: '感染者数、感染者数移動平均',
                    padding: 5,
                    fontSize: 20
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        fontSize: 14,
                        padding: 5
                    }
                },
                scales: {
                    xAxes: [{
                        id: 'X軸',
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            fontSize: 18
                        },
                        gridLines: {
                        },
                        ticks: {
                            autoSkip: true,
                            fontSize: 10
                        },
                        offset: true
                    }],
                    yAxes: [
                        {
                            id: 'y左軸',
                            position: 'left',
                            gridLines: {
                                // lineWidth: 0,
                                // display: false,
                            },
                            scaleLabel: {
                                display: window.screen.width > 414,
                                labelString: '感染者数（人）',
                                fontSize: 18
                            },
                            ticks: {
                                // display: window.screen.width > 321,
                                min: 0,
                                max: max_count+100,
                                stepSize: 500
                            }
                        }
                    ]
                },
        
            }
            }    
         )
        var canvas_r = document.getElementById("myLineChart_r");
        canvas_r.width=window.innerWidth*0.3;
        canvas_r.height=window.innerHeight*0.3;
        var ctx_r = canvas_r.getContext('2d');
        var myLineChart_r = new Chart(ctx_r, {
            type: 'bar', //　ここはbarにしないと全部が表示されない
            data: {
                labels: tokyo_yymmdd, // jsonから抜きだした日付の配列
                datasets: [
                // 折れ線グラフ
                {
                    label: '感染者率（先週比）',
                    type:'line', // 折れ線グラフの指定
                    data: tokyo_weekly, // jsonから抜き出した感染者移動平均の配列
                    borderColor : "darkblue", // グラフの枠線色指定
                    // backgroundColor : "rgba(254,97,132,0.2)",
                    pointbackgroundColor : "darkblue",
                    backgroundColor : "rgba(0,0,0,0)", // グラフの塗りつぶし色指定 折れ線グラフの場合、グラフ線以下が塗りつぶされる rgbaのaは不透明度(1:塗りつぶし,0:透明)
                    },
                 ],
            },
            options: {
                title: {
                    display: true,
                    text: '感染者率(先週比)',
                    padding: 5,
                    fontSize: 20
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        fontSize: 14,
                        padding: 5
                    }
                },
                scales: {
                    xAxes: [{
                        id: 'X軸',
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            fontSize: 18
                        },
                        gridLines: {
                        },
                        ticks: {
                            autoSkip: true,
                            fontSize: 10
                        },
                        // offset: true
                    }],
                    yAxes: [
                        {
                            id: 'y左軸',
                            position: 'left',
                            gridLines: {
                                // lineWidth: 0,
                                // display: false,
                            },
                            scaleLabel: {
                                display: window.screen.width > 414,
                                labelString: '感染者数（人）',
                                fontSize: 18
                            },
                            ticks: {
                                // display: window.screen.width > 321,
                                min: 0,
                                max: max_ratio+0.5,
                                stepSize: 0.5
                            }
                        }
                    ]
                },
            },
            annotation: {
                annotations: [{
                        type: 'line',
                        drawTime: 'afterDatasetsDraw',
                        id: 'y左軸',
                        mode: 'horizontal',
                        scaleID: 'a-line-1',
                        value: 0.5,
                        endValue: 0.5,
                        borderColor: 'red',
                        borderWidth: 3,
                        borderDash: [2, 2],
                        borderDashOffset: 1
                        // label: {
                        //     backgroundColor: 'rgba(255,255,255,0.8)',
                        //     bordercolor: 'rgba(200,60,60,0.8)',
                        //     borderwidth: 2,
                        //     fontSize: 10,
                        //     fontStyle: 'bold',
                        //     fontColor: 'rgba(200,60,60,0.8)',
                        //     xPadding: 10,
                        //     yPadding: 10,
                        //     cornerRadius: 3,
                        //     position: 'left',
                        //     xAdjust: 0,
                        //     yAdjust: 0,
                        //     enabled: true,
                        //     content: '平均気温(2019) 15.6℃'
                        // }
                    }
                ]
            }
         }
        )
    }