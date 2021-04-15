    // ブラウザが開かれたら動くやつ
    window.onload = function(){
        // 東京都公開のjsonデータを取得する
        let requestURL ='https://raw.githubusercontent.com/tokyo-metropolitan-gov/covid19/development/data/daily_positive_detail.json';
        let request = new XMLHttpRequest(); // webからデータ受信するためのインスタンス作成。pythonみたいに外部ライブラリをimportしなくていいのは楽

        request.open('GET', requestURL); // 第一引数はデータを受け取るのでGETでよい　第二引数はデータ取得先のURL

        request.responseType = 'json'; //　とってくるデータはjsonだと教えてやる
        request.send();  // 受信実行？

        // requestに入ってるjsonをresponseで取り出して変数tokyotownにセットしたのち、
        // get_weekly_gain_ratio関数で必要な要素を抽出し、draw_graph関数でグラフを描く
        request.onload = function() {
            // データを取得する
            const tokyotown = request.response;
            // 戻り値が配列の場合、配列内に変数を指定して受け取ることができるみたい
            let [tokyo_yymmdd,tokyo_weekly,tokyo_count,tokyo_average] = get_weekly_gain_ratio(tokyotown);

            var DAYS = 300; //グラフの対象日数を指定。最新から何日前にするか(-DAYS)でスライスする
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
    }

// グラフ化対象データを抜き取る
    function get_weekly_gain_ratio(jsonObj) {
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
        var ctx = document.getElementById("myLineChart");
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
                    borderColor : "red", // グラフの枠線色指定
                    // backgroundColor : "rgba(254,97,132,0.2)",
                    backgroundColor : "rgba(255,0,0,0.1)", // グラフの塗りつぶし色指定 折れ線グラフの場合、グラフ線以下が塗りつぶされる rgbaのaは不透明度(1:塗りつぶし,0:透明)
                    // yAxisID:'y-axis-1',
                    },
                // 棒グラフ
                {
                    label: '感染者数',
                    type:'bar', // 棒グラフの指定
                    data: tokyo_count, // jsonから抜き出した感染者数の配列
                    //   borderColor: "rgba(255,0,0,1)",
                    borderColor: "gray",
                    backgroundColor: "gray",
                    // yAxisID:'y-axis-2',
                    },
                 ],
            },
            }    
        )
    }