//ไอดีร้าน
document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('id_shop');
    const shopName = localStorage.getItem('shop_name');

    console.log('ID:', id);
    console.log('Shop Name:', shopName);

});


$(document).ready(function() {
    let chartInstance; // ตัวแปรเก็บอินสแตนซ์ของกราฟ

    // ฟังก์ชันนี้จะรับข้อมูลที่กรองแล้วและแสดงในตาราง พร้อมกับคำนวณข้อมูลต่าง ๆ
    function addToTable(filteredData) {
        console.log('filteredData:', filteredData); // แสดงข้อมูลที่กรองแล้วในคอนโซลสำหรับการตรวจสอบ
    
        // ตัวแปรสำหรับเก็บข้อมูลรวม
        let totalIncome = 0;
        let totalExpense = 0;
        let netProfit = 0;
        let debtorMoney = 0;
        let cashMoney = 0;
    
        // ล้างข้อมูลเดิมในตาราง
        $('#accountingTableBody').empty();
    
        // ตรวจสอบข้อมูลใน filteredData และเพิ่มลงในตาราง
        filteredData.forEach((item, index) => {
            let a = parseFloat(item.a) || 0;
            let b = parseFloat(item.b) || 0;
            let c = parseFloat(item.c) || 0;
            let c2 = parseFloat(item.c2) || 0;
            let d = parseFloat(item.d) || 0;
            let d2 = parseFloat(item.d2) || 0;
    
            // คำนวณข้อมูลรวม
            totalIncome += a;
            totalExpense += b;
            debtorMoney += (c - c2);
            cashMoney += (d - d2);
    
            // เพิ่มข้อมูลลงในตาราง
            $('#accountingTableBody').append(`
                <tr>
                    <td>${filteredData.length - index}</td> <!-- แสดงลำดับที่ในตาราง -->
                    <td>${item.date}</td> <!-- วันที่ -->
                    <td>${item.description}</td> <!-- คำอธิบาย -->
                    <td>${a !== 0 ? `<span style="color: green;">${a > 0 ? '+' : ''}${a}</span>` : ''}</td> <!-- รายได้ -->
                    <td>${b !== 0 ? `<span style="color: green;">${b > 0 ? '+' : ''}${b}</span>` : ''}</td> <!-- ค่าใช้จ่าย -->
                    <td>${c !== 0 ? `<span style="color: green;">${c > 0 ? '+' : ''}${c}</span>` : ''}${c2 !== 0 ? `<span style="color: red;">${c2 > 0 ? '-' : ''}${c2}</span>` : ''}</td> <!-- เงินที่ลูกหนี้ -->
                    <td>${d !== 0 ? `<span style="${d < 0 ? 'color: red;' : 'color: green;'}">${d > 0 ? '+' : ''}${d}</span>` : ''}${d2 !== 0 ? `<span style="color: red;">${d2 > 0 ? '-' : ''}${d2}</span>` : ''}</td> <!-- เงินสด -->
                </tr>
            `);
        });
    
        // คำนวณกำไรสุทธิ
        netProfit = totalIncome - totalExpense;
    
        // สร้างกราฟสรุปผล
        createChart(totalIncome, totalExpense, netProfit, debtorMoney, cashMoney);
    }
    

    // ฟังก์ชันนี้ใช้สำหรับสร้างกราฟที่แสดงสรุปผล
    function createChart(totalIncome, totalExpense, netProfit, debtorMoney, cashMoney) {
        // ดึง context ของ canvas สำหรับการวาดกราฟ
        const ctx = document.getElementById('summaryChart').getContext('2d');

        // ทำลายกราฟเดิมหากมีอยู่
        if (chartInstance) {
            chartInstance.destroy();
        }

        // สร้างกราฟใหม่
        chartInstance = new Chart(ctx, {
            type: 'bar', // ประเภทของกราฟ
            data: {
                labels: ['รายได้', 'ค่าใช้จ่าย', 'กำไรสุทธิ', 'เงินที่ลูกหนี้', 'เงินสด'], // ชื่อของแต่ละข้อมูลในกราฟ
                datasets: [{
                    label: 'สรุปผลตามช่วงเวลา',
                    data: [totalIncome, totalExpense, netProfit, debtorMoney, cashMoney], // ข้อมูลที่จะแสดงในกราฟ
                    backgroundColor: [ // สีพื้นหลังของแท่งกราฟ
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [ // สีกรอบของแท่งกราฟ
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1 // ความหนาของกรอบ
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // ตั้งค่าให้แกน Y เริ่มต้นจาก 0
                    }
                }
            }
        });
    }

    // ตั้งค่า daterangepicker สำหรับการเลือกช่วงเวลา
    $('#dateRange').daterangepicker({
        locale: {
            format: 'YYYY-MM-DD'
        },
        autoUpdateInput: false, // ปิดการอัพเดตอัตโนมัติของอินพุต
        startDate: moment().startOf('month'), // วันที่เริ่มต้นคือวันที่แรกของเดือนปัจจุบัน
        endDate: moment().endOf('month') // วันที่สิ้นสุดคือวันที่สุดท้ายของเดือนปัจจุบัน
    });

    // การตั้งค่าเมื่อเลือกช่วงเวลาใน daterangepicker
    $('#dateRange').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
    });

    // การตั้งค่าเมื่อยกเลิกการเลือกช่วงเวลาใน daterangepicker
    $('#dateRange').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });

    // ฟังก์ชันค้นหาและกรองข้อมูลตามช่วงเวลา
    window.customSearch2 = function() {
        var dateRange = $('#dateRange').val(); // ดึงค่าช่วงเวลาจาก daterangepicker
        if (dateRange === '') {
            alert("เลือกช่วงเวลาสรุปผล"); // แจ้งเตือนหากไม่เลือกช่วงเวลา
            return;
        }
        var dates = dateRange.split(" - ");
        var startDate = moment(dates[0], 'YYYY-MM-DD'); // แปลงวันที่เริ่มต้น
        var endDate = moment(dates[1], 'YYYY-MM-DD'); // แปลงวันที่สิ้นสุด
        var table = document.getElementById("accountingTable");
        var tr = table.getElementsByTagName("tr");
    
        var filteredData = [];
    
        // วนลูปผ่านแถวในตาราง
        for (var i = 1; i < tr.length; i++) {
            var tdDate = tr[i].getElementsByTagName("td")[1];
            var tdIncome = tr[i].getElementsByTagName("td")[3];
            var tdExpense = tr[i].getElementsByTagName("td")[4];
            var tdDebtor = tr[i].getElementsByTagName("td")[5];
            var tdCash = tr[i].getElementsByTagName("td")[6];
    
            if (tdDate) {
                var txtValue = tdDate.textContent || tdDate.innerText;
                var cellDate = moment(txtValue, 'YYYY-MM-DD'); // แปลงวันที่ในตาราง
    
                // เพิ่มข้อมูลที่ตรงกับช่วงเวลาไปยัง filteredData
                if (cellDate.isBetween(startDate, endDate, null, '[]')) {
                    tr[i].style.display = ""; // แสดงแถว
                    
                    // อ่านค่าจากเซลล์
                    var income = parseFloat(tdIncome.textContent.replace(/[^0-9.-]+/g, '')) || 0;
                    var expense = parseFloat(tdExpense.textContent.replace(/[^0-9.-]+/g, '')) || 0;
                    var debtor = parseFloat(tdDebtor.textContent.replace(/[^0-9.-]+/g, '')) || 0;
                    var cash = parseFloat(tdCash.textContent.replace(/[^0-9.-]+/g, '')) || 0;
    
                    // เพิ่มข้อมูลที่ตรงกับช่วงเวลาไปยัง filteredData
                    filteredData.push({
                        date: txtValue,
                        description: tr[i].getElementsByTagName("td")[2].textContent, // คำอธิบาย
                        a: income,
                        b: expense,
                        c: debtor,
                        c2: parseFloat(tr[i].getElementsByTagName("td")[5].textContent.replace(/[^0-9.-]+/g, '')) || 0, // เงินที่ลูกหนี้
                        d: cash,
                        d2: parseFloat(tr[i].getElementsByTagName("td")[6].textContent.replace(/[^0-9.-]+/g, '')) || 0 // เงินสด
                    });
                } else {
                    tr[i].style.display = "none"; // ซ่อนแถวที่ไม่ตรงกับช่วงเวลา
                }
            }
        }
    
        // แสดงข้อมูลที่กรองแล้วในตาราง
        addToTable(filteredData);
    };
    



    

// ดึง creditorId จาก localStorage
const creditorId = localStorage.getItem('id_shop');

// สร้างสัญญาเพื่อเรียกใช้ API โดยเพิ่ม creditorId เป็นพารามิเตอร์
let promises = [
    $.get('/getLoanInformation1', { creditorId }),
    $.get('/getLoanInformation2', { creditorId }),
    $.get('/getRefundInformation1', { creditorId }),
    $.get('/getRefundInformation2', { creditorId }),
    $.get('/getRefunds', { creditorId }),
    $.get('/getProfitSharings', { creditorId }),
    $.get('/getSeizures', { creditorId }),
    $.get('/getSales', { creditorId }),
    $.get('/getExpenses', { creditorId }),
    $.get('/getIncomes', { creditorId }),
    $.get('/getCapitals', { creditorId })
];


    // รวบรวมข้อมูลจาก API ทั้งหมด
    $.when(...promises).done(function(...results) {
        let allData = [];

        // จัดการข้อมูลของแต่ละ API
        results[0][0].forEach(item => {
            if (item.principal) {
                allData.push({
                    date: item.loanDate,
                    description: 'ปล่อยยอดเงินต้น',
                    c: item.principal,
                    d2: item.principal
                });
            }
        });

        results[1][0].forEach(item => {
            if (item.Recommended) {
                allData.push({
                    date: item.loanDate,
                    description: 'ค่าเเนะนำ',
                    b: item.Recommended,
                    d2: item.Recommended
                });
            }
        });

        results[2][0].forEach(item => {
            if (item.refund_principal) {
                allData.push({
                    date: item.return_date,
                    description: 'คืนเงินต้น',
                    c2: item.refund_principal,
                    d: item.refund_principal
                });
            }
        });

        results[3][0].forEach(item => {
            if (item.refund_interest) {
                allData.push({
                    date: item.return_date,
                    description: 'คืนดอกเบี้ย',
                    a: item.refund_interest,
                    d: item.refund_interest
                });
            }
        });

        results[4][0].forEach(item => {
            if (item.debtAmount) {
                allData.push({
                    date: item.return_date,
                    description: 'ค่าทวงเก็บจากลูกหนี้',
                    a: item.debtAmount,
                    d: item.debtAmount
                });
            }
        });

        results[5][0].forEach(item => {
            if (item.totalShare) {
                allData.push({
                    date: item.returnDate,
                    description: 'ส่วนเเบ่งทั้งหมด',
                    b: item.totalShare,
                    d2: item.totalShare
                });
            }
        });

        results[6][0].forEach(item => {
            if (item.seizureCost) {
                allData.push({
                    date: item.seizureDate,
                    description: 'ค่ายึดทรัพย์',
                    b: item.seizureCost,
                    d2: item.seizureCost
                });
            }
        });

        results[7][0].forEach(item => {
            if (item.sellamount) {
                allData.push({
                    date: item.sell_date,
                    description: 'ขายทรัพย์',
                    a: item.sellamount,
                    d: item.sellamount
                });
            }
        });

        results[8][0].forEach(item => {
            if (item.expense_amount) {
                allData.push({
                    date: item.expense_date,
                    description: `เพิ่มค่าใช้จ่าย`,
                    b: item.expense_amount,
                    d2: item.expense_amount
                });
            }
        });

        results[9][0].forEach(item => {
            if (item.income_amount) {
                allData.push({
                    date: item.record_date,
                    description: `เพิ่มรายได้`,
                    a: item.income_amount,
                    d: item.income_amount
                });
            }
        });

        results[10][0].forEach(item => {
            if (item.capital_amount) {
                allData.push({
                    date: item.capital_date,
                    description: `เพิ่มเงินทุน`,
                    a: item.capital_amount,
                    d: item.capital_amount
                });
            }
        });

        // เพิ่มข้อมูลลงในตาราง
        addToTable(allData);
    });
});






