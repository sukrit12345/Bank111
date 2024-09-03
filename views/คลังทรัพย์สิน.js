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




async function displaySeizureData() {
    try {
        const creditorId = localStorage.getItem('id_shop'); // ดึง creditorId จาก localStorage

        if (!creditorId) {
            throw new Error('creditorId is not available in localStorage');
        }

        const response = await fetch(`/api/seize-assetsss?creditorId=${creditorId}`); // ส่ง creditorId ไปยัง API
        const data = await response.json();

        const tableBody = document.getElementById("seizureData").querySelector('tbody');
        tableBody.innerHTML = ''; // Clear the table before adding new data

        // For each seizure, create a new row
        data.forEach((seizure, index) => {
            const row = tableBody.insertRow();
            row.id = `row-${seizure._id}`; // Set the ID for the row

            // ตรวจสอบสถานะ ถ้าเป็น "ขายเเล้ว" ให้ทำการ disable ปุ่มขาย
            const isSold = seizure.status === "<span style='color: green;'>ขายเเล้ว</span>";
            const sellButton = isSold 
                ? '<button disabled><i class="fas fa-plus"></i>ขายเเล้ว</button>' 
                : `<button onclick="handleSell('${seizure._id}', '${seizure.contract_number}','${seizure.bill_number}','${seizure.id_card_number}', '${seizure.totalproperty}', '${encodeURIComponent(seizure.assetName)}', '${encodeURIComponent(seizure.assetDetails)}')"><i class="fas fa-plus"></i>ขาย</button>`;

            row.innerHTML = `
                <td>${data.length - index}</td> <!-- Reverse index order -->
                <td>${seizure.id_card_number}</td>
                <td>${seizure.contract_number}</td>
                <td>${seizure.bill_number}</td>
                <td>${seizure.seizureDate}</td>
                <td>${seizure.principal}</td>
                <td>${seizure.seizureCost}</td>
                <td>${seizure.totalproperty}</td>
                <td>${seizure.seizedAssetType}</td>
                <td>${seizure.assetName}</td>
                <td>${seizure.assetDetails}</td>
                <td>${seizure.status}</td>
                <td>
                    <button onclick="redirectToView('${seizure._id}')"><i class="fas fa-eye"></i>ดู</button>
                    <button onclick="deleteSeizure('${seizure._id}')"><i class="fas fa-trash-alt"></i>ลบ</button>
                </td>
                <td>${sellButton}</td>
                <td><button onclick="installment('${seizure._id}', '${seizure.contract_number}', '${seizure.bill_number}', '${seizure.id_card_number}', '${seizure.totalproperty}', '${seizure.assetName}', '${seizure.assetDetails}')"><i class="fas fa-plus"></i>ผ่อน</button></td>
            `;
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error.message);
    }
}






// บันทึกขายทรัพย์
function handleSell(seizure_id, contract_number, bill_number, id_card_number, totalproperty, assetName, assetDetails) {
    try {
        const row = document.getElementById(`row-${seizure_id}`);
        if (row) {
            window.location.href = `บันทึกขายทรัพย์.html?seizure_id=${seizure_id}&contract_number=${contract_number}&bill_number=${bill_number}&id_card_number=${id_card_number}&totalproperty=${totalproperty}&assetName=${encodeURIComponent(assetName)}&assetDetails=${encodeURIComponent(assetDetails)}`;
        } else {
            console.error('Row not found for ID:', seizure_id);
        }
    } catch (error) {
        console.error('Error handling sell:', error.message);
    }
}





// บันทึกผ่อนทรัพย์
function installment(seizure_id, contract_number, bill_number, id_card_number, totalproperty, assetName, assetDetails) {
    try {
        const row = document.getElementById(`row-${seizure_id}`);
        if (row) {
            window.location.href = `เพิ่มข้อมูลลูกหนี้ผ่อนทรัพย์.html?seizure_id=${seizure_id}&contract_number=${contract_number}&bill_number=${bill_number}&id_card_number=${id_card_number}&totalproperty=${totalproperty}&assetName=${encodeURIComponent(assetName)}&assetDetails=${encodeURIComponent(assetDetails)}`;
        } else {
            console.error('Row not found for ID:', seizure_id);
        }
    } catch (error) {
        console.error('Error handling sell:', error.message);
    }
}


//ดู
function redirectToView(seizureId) {
    // เปลี่ยนเส้นทางไปยังหน้า 'ดูรายละเอียด' โดยส่ง ID ของยึดทรัพย์
    window.location.href = `/บันทึกยึดทรัพย์.html?seizure_id=${seizureId}`;
}


//ลบข้อมูลทรัย์
async function deleteSeizure(seizureId) {
    try {
        const confirmDelete = confirm("คุณต้องการลบทรัพย์สินนี้หรือไม่?");
        if (!confirmDelete) {
            return; // หากผู้ใช้ยกเลิกการลบ จะไม่ดำเนินการต่อ
        }
        
        const response = await fetch(`/api/seize-assets/${seizureId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        console.log(data); // แสดงข้อมูลที่ได้จากการลบในคอนโซล

        // ลบแถวในตารางหลังจากลบข้อมูลที่เซิร์ฟเวอร์
        const rowToRemove = document.getElementById(`row-${seizureId}`);
        if (rowToRemove) {
            rowToRemove.remove();
        } else {
            console.error("ไม่พบแถวที่ต้องการลบในตาราง");
        }

        // รีเฟรชข้อมูลหลังจากที่ลบเสร็จสิ้น
        displaySeizureData();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', error.message);
    }
}

// เรียกใช้ฟังก์ชันเพื่อแสดงข้อมูลการยึดทรัพย์
displaySeizureData();




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



//ค้นหาสถานะ
function searchIdCard2() {
    var statusFilter = document.getElementById("statusFilter").value;
    var table = document.querySelector("table");
    var tr = table.getElementsByTagName("tr");

    for (var i = 0; i < tr.length; i++) {
        var found = false;

        if (tr[i].getElementsByTagName("td").length > 0) {
            if (tr[i].cells[10].innerText.trim() === statusFilter || statusFilter === "") {
                found = true;
            }

            tr[i].style.display = found ? "" : "none";
        }
    }
}

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("statusFilter").addEventListener('change', searchIdCard2);
});