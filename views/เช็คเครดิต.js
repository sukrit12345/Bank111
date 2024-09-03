document.addEventListener('DOMContentLoaded', () => {
    // ฟังก์ชันสำหรับดึงข้อมูลจาก API
    const fetchData = () => {
        fetch('/api/debtors-loans')
            .then(response => response.json())
            .then(data => {
                window.data = data; // เก็บข้อมูลไว้ใน global object
                displayData(data); // แสดงข้อมูลเบื้องต้น
            })
            .catch(error => console.error('Error fetching debtor and loan information:', error));
    };

    // ดึงข้อมูลจาก API ครั้งแรกเมื่อเริ่มโหลดหน้า
    fetchData();

    // ตั้งค่า WebSocket
    const ws = new WebSocket('ws://localhost:3000'); // ใช้ URL ของเซิร์ฟเวอร์ WebSocket

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);
        displayData(data); // ฟังก์ชันสำหรับแสดงข้อมูล
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };
});

// ฟังก์ชันนี้แสดงข้อมูลในตาราง
function displayData(data) {
    const tableBody = document.getElementById('tableBody'); // ใช้ id ของ <tbody>
    tableBody.innerHTML = ''; // ล้างข้อมูลเก่า

    // ย้อนลำดับข้อมูล
    const reversedData = data.reverse();

    reversedData.forEach((item, index) => {
        const row = document.createElement('tr');
        // คำนวณลำดับจากมากไปน้อย
        const displayIndex = reversedData.length - index;
        row.innerHTML = `
            <td>${displayIndex}</td>
            <td>${item.id_card_number}</td>
            <td>${item.first_name}</td>
            <td>${item.last_name}</td>
            <td>${item.principal}</td>
            <td>${item.interest}</td>
            <td>${item.total_amount_due}</td>
            <td>${item.status}</td>
            <td>${item.province}</td>
        `;
        tableBody.appendChild(row);
    });
}





// ฟังก์ชันนี้ทำการค้นหาข้อมูลตามสถานะที่เลือก
function searchIdCard2() {
    const selectedStatus = document.getElementById('statusFilter').value;
    let filteredData = window.data; // ใช้ข้อมูลที่เก็บไว้ใน global object

    if (selectedStatus) {
        filteredData = window.data.filter(item => item.status === selectedStatus);
    }

    displayData(filteredData); // แสดงข้อมูลที่กรองแล้ว
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