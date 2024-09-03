

//เเสดงข้อมูลลงตารางลูกหนี้
document.addEventListener("DOMContentLoaded", function() {
    fetchDataAndPopulateTable();
});



//ไอดีร้าน
document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('id_shop');
    const shopName = localStorage.getItem('shop_name');

    console.log('ID:', id);
    console.log('Shop Name:', shopName);

});



// ฟังก์ชัน fetchDataAndPopulateTable สำหรับดึงข้อมูลและเติมค่าลงในตาราง
async function fetchDataAndPopulateTable() {
    try {
        // ดึง creditorId จาก localStorage
        const creditorId = localStorage.getItem('id_shop');

        // ตรวจสอบว่ามี creditorId ใน localStorage หรือไม่
        if (!creditorId) {
            console.error('Missing creditorId in localStorage');
            return;
        }

        // ส่ง creditorId ไปที่เซิร์ฟเวอร์ผ่าน query string
        const response = await fetch(`/api/debtor-data?creditorId=${creditorId}`);
        const data = await response.json();
        
        const tableBody = document.getElementById('debtor-table-body');
        tableBody.innerHTML = ''; // ล้างแถวที่มีอยู่

        for (const [index, row] of data.entries()) {
            const tr = document.createElement('tr');
            tr.id = `row-${row._id}`; // กำหนด ID ให้กับแถว

            // เติมข้อมูลในตาราง
            tr.innerHTML = `
                <td>${data.length - index}</td> <!-- ลำดับที่จากใหม่ไปเก่า -->
                <td>${row.date}</td>
                <td>${row.id_card_number}</td>
                <td>${row.fname}</td>
                <td>${row.lname}</td>
                <td>${row.loanReturnDate || '-'}</td> <!-- Placeholder สำหรับ loan.returnDate -->
                <td>${row.loanPrincipal || '-'}</td> <!-- Placeholder สำหรับ loan.principal -->
                <td>${row.loanTotalInterest4 || '-'}</td> <!-- Placeholder สำหรับ loan.totalInterest4 -->
                <td>${row.loanTotalRefund || '-'}</td> <!-- Placeholder สำหรับ loan.totalRefund -->
                <td>${row.loanStatus || '-'}</td> <!-- Placeholder สำหรับ loan.status -->
                <td>${row.principalSum || '-'}</td> <!-- Placeholder สำหรับ Principal Sum -->
                <td>${row.refundInterestSum || '-'}</td> <!-- Placeholder สำหรับ Refund Interest Sum -->
                <td>${row.principalDifference || '-'}</td> <!-- Placeholder สำหรับ Principal Difference -->
                <td>${row.province}</td>
                <td>${row.manager}</td>
                <td> 
                    <button onclick="redirectToEdit('${row._id}')"><i class="fas fa-pencil-alt"></i>แก้ไข</button>
                    <button onclick="redirectToDelete('${row._id}', '${row.id_card_number}')"><i class="fas fa-trash-alt"></i>ลบ</button>
                </td>
                <td><button onclick="redirectToContract('${row._id}')"><i class="fas fa-eye"></i>สัญญา</button></td> 
            `;
            tableBody.appendChild(tr);

            try {
                // ดึง creditorId จาก localStorage
                const creditorId = localStorage.getItem('id_shop');
                if (!creditorId) {
                    throw new Error('creditorId not found in localStorage');
                }
            
                // Fetch the latest loan information for the debtor
                const loanResponse = await fetch(`/api/loaninformations/${row._id}?creditorId=${creditorId}`);
                const loanData = await loanResponse.json();
            
                console.log('Loan data:', loanData); // Debug loan data
            
                // Update the row with loan information
                const loanRow = document.getElementById(`row-${row._id}`);
                loanRow.cells[5].innerText = loanData.returnDate || '-';
                loanRow.cells[6].innerText = loanData.principal || '-';
                loanRow.cells[7].innerText = loanData.totalInterest4 || '-';
                loanRow.cells[8].innerText = loanData.totalRefund || '-';
                loanRow.cells[9].innerHTML = loanData.status || '-';
                loanRow.cells[9].style.color = loanData.status || 'black';
            
                // Fetch the principal sum for the debtor and update cell 10
                const principalResponse = await fetch(`/api/loan-principal-sum/${row.id_card_number}?creditorId=${creditorId}`);
                const principalData = await principalResponse.json();
                console.log('Principal data:', principalData); // Debug principal data
            
                loanRow.cells[10].innerText = principalData.totalPrincipal || '-';
            
                // Fetch the refund interest sum for the debtor and update cell 11
                const refundInterestResponse = await fetch(`/api/refund-interest-sum/${row.id_card_number}?creditorId=${creditorId}`);
                const refundInterestData = await refundInterestResponse.json();
                console.log('Refund interest data:', refundInterestData); // Debug refund interest data
            
                loanRow.cells[11].innerText = refundInterestData.totalRefundInterest || '-';
            
                // Calculate and update cell 12 with principal difference
                const principalSum = parseFloat(principalData.totalPrincipal) || 0;
                const refundInterestSum = parseFloat(refundInterestData.totalRefundInterest) || 0;
                const principalDifference = refundInterestSum - principalSum;
            
                // Display principal difference with negative sign if less than zero
                loanRow.cells[12].innerText = (principalDifference === 0 || principalDifference === undefined || principalDifference === null) 
                    ? '-' 
                    : (principalDifference < 0 ? `-${Math.abs(principalDifference).toFixed(0)}` : principalDifference.toFixed(0));
            
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            
        }

        calculateTotalIDCard();

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}





//เเก้ไขข้อมูลลูกหนี้
function redirectToEdit(debtorId) {
    window.location.href = `บันทึกข้อมูลลูกหนี้.html?id=${debtorId}`;
}




// ลบข้อมูลลูกหนี้พร้อมโหลดหน้าใหม่
function redirectToDelete(objectId) {
    // ข้อความยืนยัน
    const confirmation = confirm(`คุณต้องการลบข้อมูลลูกหนี้นี้หรือไม่?`);

    // ถ้าผู้ใช้ยืนยันการลบ
    if (confirmation) {
        // ส่งคำขอลบข้อมูลไปยัง API โดยใช้ fetch
        fetch(`/api/delete-debtor/${objectId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete debtor');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            // ลบแถวที่มี ObjectId ออกจาก DOM
            const rowElement = document.getElementById(`row-${objectId}`);
            if (rowElement) {
                rowElement.remove();
            }
            // โหลดหน้าใหม่
            location.reload();
        })
        .catch(error => console.error('Error deleting debtor:', error));
    }
}




//ไปหน้าสัญญา
function redirectToContract(id) {
    const row = document.getElementById(`row-${id}`);
    if (row) {
        const id_card_number = row.cells[2].textContent;
        const fname = row.cells[3].textContent;
        const lname = row.cells[4].textContent;
        const manager = row.cells[14].textContent;

        window.location.href = `สัญญา.html?id_card_number=${id_card_number}&fname=${fname}&lname=${lname}&manager=${manager}`;
    } else {
        console.error('Row not found for ID:', id);
    }
}












//ค้นหาเลขบัตรประชาชน13หลัก
function searchTable() {
    var input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.trim(); // ตัดช่องว่างที่อาจเกิดขึ้นได้
    
    // ตรวจสอบว่าเลขบัตรประชาชนมีความยาว 13 หลักหรือไม่
    if (filter.length !== 13 || isNaN(filter)) {
      alert("โปรดป้อนเลขบัตรประชาชนที่ถูกต้อง (13 หลัก)");
      return;
    }
  
    // ค้นหาในทุกคอลัมน์
    table = document.querySelector("table");
    tr = table.getElementsByTagName("tr");
  
    for (i = 0; i < tr.length; i++) {
      var found = false; // เพิ่มตัวแปรเพื่อตรวจสอบว่าพบข้อมูลหรือไม่
  
      for (j = 0; j < tr[i].cells.length; j++) {
        td = tr[i].getElementsByTagName("td")[j];
        if (td) {
          txtValue = td.textContent || td.innerText;
          // เปรียบเทียบข้อมูลในคอลัมน์กับค่าที่ค้นหา
          if (txtValue.trim() === filter) {
            found = true;
            break;
          }
        }
      }
  
      if (found) {
        tr[i].style.display = ""; // แสดงแถวที่พบข้อมูล
      } else {
        // ตรวจสอบว่าอิลิเมนต์ที่กำลังตรวจสอบเป็น <th> หรือไม่
        if (tr[i].getElementsByTagName("th").length === 0) {
          tr[i].style.display = "none"; // ซ่อนแถวที่ไม่พบข้อมูล
        }
      }
    }
}


  



//ค้นหาชื่อจังหวัด
function customSearch3() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("newSearchInput3"); // เปลี่ยน ID ใหม่ที่นี่
    filter = input.value.toUpperCase();
    table = document.getElementsByTagName("table")[0];
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[13]; // แก้ index เป็นตำแหน่งที่ต้องการค้นหา ในที่นี้คือ คอลัมน์ที่ 16 (index 15)
        if (td) {
            txtValue = td.textContent || td.innerText;
            // ใช้เงื่อนไขเพิ่มเติมเพื่อให้ค้นหาได้ทั้งตัวเล็กและตัวใหญ่
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}


//ค้นหาชื่อเเอดมิน
function customSearch1() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("newSearchInput1"); // เปลี่ยน ID ใหม่ที่นี่
    filter = input.value.toUpperCase();
    table = document.getElementsByTagName("table")[0];
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[14]; // แก้ index เป็นตำแหน่งที่ต้องการค้นหา ในที่นี้คือ คอลัมน์ที่ 16 (index 15)
        if (td) {
            txtValue = td.textContent || td.innerText;
            // ใช้เงื่อนไขเพิ่มเติมเพื่อให้ค้นหาได้ทั้งตัวเล็กและตัวใหญ่
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
} 



//ค้นหาวันที่
$(function() {
    $('#dateRange').daterangepicker({
        locale: {
            format: 'YYYY-MM-DD'
        },
        autoUpdateInput: false, // Don't auto-update the input field
        startDate: moment().startOf('month'),
        endDate: moment().endOf('month')
    });

    // Update input field manually when dates are chosen
    $('#dateRange').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
    });

    // Clear input field when cancel is clicked
    $('#dateRange').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });
});

function customSearch2() {
    var dateRange = $('#dateRange').val();
    if (dateRange === '') {
        alert("เลือกช่วงเวลาที่ต้องคืน");
        return;
    }
    var dates = dateRange.split(" - ");
    var startDate = moment(dates[0], 'YYYY-MM-DD');
    var endDate = moment(dates[1], 'YYYY-MM-DD');
    var table = document.getElementById("your_table_id");
    var tr = table.getElementsByTagName("tr");

    for (var i = 1; i < tr.length; i++) { // เริ่มต้นที่ 1 เพื่อข้ามแถวหัวตาราง
        var td = tr[i].getElementsByTagName("td")[5]; // คอลัมน์ที่ต้องการค้นหา (index 1)
        if (td) {
            var txtValue = td.textContent || td.innerText;
            var cellDate = moment(txtValue, 'YYYY-MM-DD');
            if (cellDate.isBetween(startDate, endDate, undefined, '[]')) { // รวมทั้ง startDate และ endDate
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}






window.onload = function() {
    searchIdCard2(); // Call the search function on page load
};

function searchIdCard2() {
    var statusFilter = document.getElementById("statusFilter").value;
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");

    for (var i = 0; i < tr.length; i++) {
        var found = false;

        if (tr[i].getElementsByTagName("td").length > 0) {
            if (tr[i].cells[9].innerText.trim() === statusFilter || statusFilter === "") {
                found = true;
            }

            tr[i].style.display = found ? "" : "none";
        }
    }

    // Call calculate functions after filtering
    calculateTotalPrincipalAmount();
    calculateTotalInterestAmount();
    calculateTotalRefundAmount();
    updatePieChart();
}

// คำนวณเงินต้นทั้งหมดตามสถานะ
function calculateTotalPrincipalAmount() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var totalPrincipalAmount = 0;

    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0 && tr[i].style.display !== "none") {
            var principalAmount = parseFloat(tr[i].cells[6].innerText.trim());
            if (!isNaN(principalAmount)) {
                totalPrincipalAmount += principalAmount;
            }
        }
    }

    return totalPrincipalAmount;
}

// คำนวณดอกเบี้ยทั้งหมดตามสถานะ
function calculateTotalInterestAmount() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var totalInterestAmount = 0;

    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0 && tr[i].style.display !== "none") {
            var interestAmount = parseFloat(tr[i].cells[7].innerText.trim());
            if (!isNaN(interestAmount)) {
                totalInterestAmount += interestAmount;
            }
        }
    }

    return totalInterestAmount;
}

// คำนวณเงินที่ต้องคืนทั้งหมดตามสถานะ
function calculateTotalRefundAmount() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var totalRefundAmount = 0;

    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0 && tr[i].style.display !== "none") {
            var refundAmount = parseFloat(tr[i].cells[8].innerText.trim());
            if (!isNaN(refundAmount)) {
                totalRefundAmount += refundAmount;
            }
        }
    }

    return totalRefundAmount;
}

// ฟังก์ชันในการสร้างและอัพเดทกราฟวงกลม
var myPieChart;
function updatePieChart() {
    var totalPrincipalAmount = calculateTotalPrincipalAmount();
    var totalInterestAmount = calculateTotalInterestAmount();
    var totalRefundAmount = calculateTotalRefundAmount();

    var ctx = document.getElementById('myPieChart').getContext('2d');
    if (myPieChart) {
        myPieChart.destroy();
    }
    myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['เงินต้นทั้งหมด', 'ดอกเบี้ยทั้งหมด', 'เงินที่ต้องคืนทั้งหมด'],
            datasets: [{ data: [totalPrincipalAmount, totalInterestAmount, totalRefundAmount], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: '',
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        if (value === 0) {
                            return "";
                        } else {
                            let percentage = (value * 100 / sum).toFixed() + "%";
                            return value.toLocaleString() + " บาท\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0" + percentage;
                        }
                    },
                    color: 'black',
                    font: {
                        size: 12,
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}






















//คำนวณลูกหนี้ในระบบทั้งหมด
function calculateTotalIDCard() {
            var table = document.querySelector("table");
            var tr = table.getElementsByTagName("tr");
            var totalid_card = [];

            // Start from i = 1 to skip the table header row
            for (var i = 1; i < tr.length; i++) {
                if (tr[i].getElementsByTagName("td").length > 0) {
                    // Get the ID card number from the cell at index 2 (starting from 0)
                    var id_card = tr[i].cells[2].innerText.trim();
                    if (id_card !== "") {
                        totalid_card.push(id_card);
                    }
                }
            }

            // Count unique ID card numbers
            var uniqueIDCardCount = new Set(totalid_card).size;

            // Display the result in the element with id "totalid_card"
            var resultContainer = document.getElementById("totalid_card");
            resultContainer.textContent = "ลูกหนี้ในระบบทั้งหมด: " + uniqueIDCardCount + " คน";
        }



//คำนวณลูกหนี้อยู่ในสัญญา
document.addEventListener("DOMContentLoaded", function() {
    // Call calculateTotalDebtorsInContract() when the HTML document is loaded
    calculateTotalDebtorsInContract();
});

function calculateTotalDebtorsInContract() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var totalDebtors = [];

    // Start from i = 1 to skip the table header row
    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0) {
            // Get the status from the cell at index 8 (starting from 0)
            var status = tr[i].cells[9].innerText.trim(); // Changed from 8 to 7

            // Check if the status contains the phrase "อยู่ในสัญญา"
            if (status.includes("อยู่ในสัญญา")) {
                totalDebtors.push("dummy"); // Just push a dummy value to count the debtors
            }
        }
    }

    // Count total debtors in contract
    var totalDebtorsCount = totalDebtors.length;

    // Display the result in the element with id "totalDebtorsInContract"
    var resultContainer = document.getElementById("totalDebtorsInContract");
    resultContainer.textContent = "ลูกหนี้อยู่ในสัญญา: " + totalDebtorsCount + ' คน';
}



//คำนวณลูกหนี้ครบกำหนดสัญญา
document.addEventListener("DOMContentLoaded", function() {
    // Call calculateTotalDebtorsWithContracts() when the HTML document is loaded
    calculateTotalDebtorsWithContracts();
});

function calculateTotalDebtorsWithContracts() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var totalDebtors = [];

    // Start from i = 1 to skip the table header row
    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0) {
            // Get the status from the cell at index 8 (starting from 0)
            var status = tr[i].cells[9].innerText.trim();

            // Check if the status contains the phrase "ครบกำหนดชำระ"
            if (status.includes("ครบสัญญา")) {
                totalDebtors.push("dummy"); // Just push a dummy value to count the debtors
            }
        }
    }

    // Count total debtors with contracts
    var totalDebtorsCount = totalDebtors.length;

    // Display the result in the element with id "debtorsWithContracts"
    var resultContainer = document.getElementById("debtorsWithContracts");
    resultContainer.textContent = "ลูกหนี้ครบกำหนดสัญญา: " + totalDebtorsCount + ' คน';
}




//คำนวณลูกหนี้เลยกำหนดสัญญา
document.addEventListener("DOMContentLoaded", function() {
    // Call calculateTotalDebtorsWhoExceededContracts() when the HTML document is loaded
    calculateTotalDebtorsWhoExceededContracts();
});

function calculateTotalDebtorsWhoExceededContracts() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var totalDebtors = [];

    // Start from i = 1 to skip the table header row
    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0) {
            // Get the status from the cell at index 8 (starting from 0)
            var status = tr[i].cells[8].innerText.trim();

            // Check if the status contains the phrase "เลยกำหนดสัญญา"
            if (status.includes("เลยสัญญา")) {
                totalDebtors.push("dummy"); // Just push a dummy value to count the debtors
            }
        }
    }

    // Count total debtors who exceeded contracts
    var totalDebtorsCount = totalDebtors.length;

    // Display the result in the element with id "debtorsWhoExceededContracts"
    var resultContainer = document.getElementById("debtorsWhoExceededContracts");
    resultContainer.textContent = "ลูกหนี้เลยกำหนดสัญญา: " + totalDebtorsCount + ' คน';
}




//คำนวณลูกหนี้ชำระครบ
document.addEventListener("DOMContentLoaded", function() {
    // Call calculateFullyPaidDebtors() when the HTML document is loaded
    calculateFullyPaidDebtors();
});

function calculateFullyPaidDebtors() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var fullyPaidDebtors = [];

    // Start from i = 1 to skip the table header row
    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0) {
            // Get the status from the cell at index 8 (starting from 0)
            var status = tr[i].cells[8].innerText.trim();

            // Check if the status contains the phrase "ชำระครบ"
            if (status.includes("ชำระครบ")) {
                fullyPaidDebtors.push("dummy"); // Just push a dummy value to count the fully paid debtors
            }
        }
    }

    // Count total fully paid debtors
    var totalFullyPaidDebtorsCount = fullyPaidDebtors.length;

    // Display the result in the element with id "fullyPaidDebtors"
    var resultContainer = document.getElementById("fullyPaidDebtors");
    resultContainer.textContent = "ลูกหนี้ชำระครบ: " + totalFullyPaidDebtorsCount + ' คน';
}




//คำนวณลูกหนี้เเบล็คลิช
document.addEventListener("DOMContentLoaded", function() {
    // Call calculateDebtorsBlacklist() when the HTML document is loaded
    calculateDebtorsBlacklist();
});

function calculateDebtorsBlacklist() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var debtorsBlacklist = [];

    // Start from i = 1 to skip the table header row
    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0) {
            // Get the status from the cell at index 8 (starting from 0)
            var status = tr[i].cells[8].innerText.trim();

            // Check if the status contains the phrase "อยู่ในสัญญา"
            if (status.includes("เเบล็คลิช")) {
                debtorsBlacklist.push("dummy"); // Just push a dummy value to count the debtors
            }
        }
    }

    // Count total debtors on blacklist
    var totalDebtorsBlacklistCount = debtorsBlacklist.length;

    // Display the result in the element with id "debtorsBlacklist"
    var resultContainer = document.getElementById("debtorsBlacklist");
    resultContainer.textContent = "ลูกหนี้เเบล็คลิช: " + totalDebtorsBlacklistCount + ' คน';
}










//คำนวณเงินต้นปล่อยสะสมทั้งหมด
window.onload = function() {
    calculateTotalAccumulatedPrincipal();
};

function calculateTotalAccumulatedPrincipal() {
    var table = document.getElementById('your_table_id');
    var totalAccumulatedPrincipal = 0;

    // Loop through each row in the table
    for (var i = 1; i < table.rows.length; i++) { // Start from 1 to skip header row
        var row = table.rows[i];
        var accumulatedPrincipalCell = row.cells[10]; // Cell index 10 for accumulated principal

        // Get the text content of the cell, remove commas, and convert to float
        var cellText = accumulatedPrincipalCell.innerText.trim().replace(/,/g, '');
        var accumulatedPrincipal = parseFloat(cellText);

        console.log(`Row ${i}: ${cellText} -> ${accumulatedPrincipal}`); // Debug log

        if (!isNaN(accumulatedPrincipal)) {
            totalAccumulatedPrincipal += accumulatedPrincipal;
        }
    }

    // Update the total accumulated principal element
    var totalAccumulatedPrincipalElement = document.getElementById('totalAccumulatedPrincipal');
    totalAccumulatedPrincipalElement.textContent = 'เงินต้นสะสมทั้งหมด: ' + totalAccumulatedPrincipal.toLocaleString() + ' บาท';
}


//คำนวณดอกเบี้ยสะสมทั้งหมด
document.addEventListener("DOMContentLoaded", function() {
    // Call calculateTotalAccumulatedInterest() when the HTML document is loaded
    calculateTotalAccumulatedInterest();
});

function calculateTotalAccumulatedInterest() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var totalShareAmount = 0; // เปลี่ยนชื่อตัวแปรเป็น totalShareAmount

    // Start from i = 1 to skip the table header row
    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0) {
            // Get the share amount from the cell at index 9 (starting from 0)
            var share = parseFloat(tr[i].cells[10].innerText.trim()); // คำนวณค่าที่เซลล์ที่ 10
            if (!isNaN(share)) {
                totalShareAmount += share; // เพิ่มค่าลงในตัวแปร totalShareAmount
            }
        }
    }

    // Display the result in the element with id "totalAccumulatedInterest"
    var resultContainer = document.getElementById("totalAccumulatedInterest");
    resultContainer.textContent = "ดอกเบี้ยได้รับสะสมทั้งหมด: " + totalShareAmount.toLocaleString() + " บาท";
}



//คำนวณกำไรขั้นต้นสะสมทั้งหมด
document.addEventListener("DOMContentLoaded", function() {
    // เรียกใช้ calculateTotalNetProfit() เมื่อเอกสาร HTML โหลดเสร็จ
    calculateTotalNetProfit();
});

function calculateTotalNetProfit() {
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");
    var totalNetProfit = 0;

    for (var i = 1; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td").length > 0) {
            var profit = parseFloat(tr[i].cells[12].innerText.trim());
            if (!isNaN(profit)) {
                totalNetProfit += profit;
            }
        }
    }

    // แสดงผลลัพธ์ใน element ที่กำหนด เช่น div หรือ span
    var resultContainer = document.getElementById("totalNetProfit");
    resultContainer.textContent = "กำไรขั้นต้นสะสมทั้งหมด: " + totalNetProfit.toLocaleString() + " บาท";
}










//เเสดงจำนวนหน้าเเจ้งเตือน
document.addEventListener('DOMContentLoaded', () => {
    // ดึงค่าจำนวนแจ้งเตือนจาก localStorage
    const notificationCount = localStorage.getItem('notificationCount');
    if (notificationCount) {
        const notificationLink = document.querySelector('a.active2');
        if (notificationLink) {
            notificationLink.setAttribute('data-count', notificationCount);
        }
    }
});
