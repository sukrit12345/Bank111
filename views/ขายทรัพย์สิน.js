
//ไอดีร้าน
document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('id_shop');
    const shopName = localStorage.getItem('shop_name');

    console.log('ID:', id);
    console.log('Shop Name:', shopName);

});

function redirectToContractPage2() {
    window.location.href = '/คลังทรัพย์สิน.html';
}

function redirectToContractPage3() {
    window.location.href = '/ขายทรัพย์สิน.html';
}

function redirectToContractPage4() {
    window.location.href = '/ผ่อนทรัพย์.html';
}




async function fetchSales() {
    try {
        // ดึง creditorId จาก localStorage
        const creditorId = localStorage.getItem('id_shop');
        
        // ตรวจสอบว่า creditorId มีอยู่หรือไม่
        if (!creditorId) {
            console.error('creditorId is not available in localStorage');
            return;
        }

        // ส่ง creditorId ไปยัง API
        const response = await fetch(`/sales?creditorId=${creditorId}`);
        
        // ตรวจสอบสถานะของการตอบกลับ
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // แปลงข้อมูลการขายที่ได้รับมาเป็น JSON
        const sales = await response.json();

        // เข้าถึง tbody ของตาราง
        const table = document.getElementById('m').getElementsByTagName('tbody')[0];

        // เคลียร์แถวที่มีอยู่ก่อนหน้านี้
        table.innerHTML = '';

        // เพิ่มแถวใหม่สำหรับแต่ละรายการขาย
        sales.forEach((sale, index) => {
            const row = table.insertRow();

            row.innerHTML = `
                <td>${sales.length - index}</td> <!-- ลำดับในรูปแบบเรียงจากมากไปน้อย -->
                <td>${sale.id_card_number}</td>
                <td>${sale.contract_number}</td>
                <td>${sale.bill_number}</td>
                <td>${sale.sell_date}</td>
                <td>${sale.totalproperty}</td>
                <td>${sale.assetName}</td>
                <td>${sale.assetDetails}</td>
                <td>${sale.sellamount}</td>
                <td>${sale.netprofit}</td>
                <td>${sale.status}</td>
                <td>
                    <button onclick="showe('${sale._id}')"><i class="fas fa-eye"></i>ดู</button>
                    <button onclick="deleteSale('${sale._id}')"><i class="fas fa-trash-alt"></i>ลบ</button>
                </td>
            `;
        });
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการขาย:', err);
    }
}


function showe(saleId) {
    // สร้าง URL ใหม่ที่มีพารามิเตอร์ _id
    const url = `บันทึกขายทรัพย์.html?_id=${saleId}`;
    
    // เปลี่ยนหน้าไปยัง URL ที่สร้างขึ้น
    window.location.href = url;
}



//ลบทิ้ง
async function deleteSale(saleId) {
    const confirmDelete = confirm("คุณต้องการลบรายการขายทรัพย์สินนี้หรือไม่?");
    if (!confirmDelete) {
        return; // ยกเลิกการลบถ้าผู้ใช้ไม่ยืนยัน
    }
    try {
        const response = await fetch(`/sales/${saleId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('ไม่สามารถลบข้อมูลได้');
        }
        // Reload sales data after deletion
        fetchSales();
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', err);
    }
}

// Call fetchSales function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", fetchSales);




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