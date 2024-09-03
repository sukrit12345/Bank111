//ไอดีร้าน
document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('id_shop');
    const shopName = localStorage.getItem('shop_name');
  
    console.log('ID:', id);
    console.log('Shop Name:', shopName);
  
  });
  
  //รับข้อมูล เลขบปชช ชื่อ นามสกุล
  document.addEventListener("DOMContentLoaded", function() {
      const urlParams = new URLSearchParams(window.location.search);
  
      // ดึงค่า id_card_number และแสดงใน HTML
      const idCardNumber = urlParams.get('id_card_number');
      document.getElementById('id-card-number').textContent = idCardNumber ? idCardNumber : "N/A";
  
      // ดึงค่า fname และแสดงใน HTML
      const firstName = urlParams.get('fname');
      document.getElementById('first-name').textContent = firstName ? firstName : "N/A";
  
      // ดึงค่า lname และแสดงใน HTML
      const lastName = urlParams.get('lname');
      document.getElementById('last-name').textContent = lastName ? lastName : "N/A";
  
      // ดึงค่า manager และแสดงใน HTML
      const manager = urlParams.get('manager');
      document.getElementById('manager').textContent = manager ? manager : "N/A";
  
  
  });
  
  
  
  //เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มสัญญา
  function redirectToContractPage2() {
      const urlParams = new URLSearchParams(window.location.search);
      const idCardNumber = urlParams.get('id_card_number');
      const firstName = urlParams.get('fname');
      const lastName = urlParams.get('lname');
      const manager = urlParams.get('manager');
  
  
      // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
      const newURL = '/สัญญาผ่อนทรัพย์.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                     '&fname=' + encodeURIComponent(firstName) +
                     '&lname=' + encodeURIComponent(lastName)+
                     '&manager=' + encodeURIComponent(manager);
  
      
      // นำ URL ใหม่ไปที่หน้าที่ต้องการ
      window.location.href = newURL;
  }
  
  
  
  //เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มคืนเงิน
  function redirectToContractPage3() {
      const urlParams = new URLSearchParams(window.location.search);
      const idCardNumber = urlParams.get('id_card_number');
      const firstName = urlParams.get('fname');
      const lastName = urlParams.get('lname');
      const manager = urlParams.get('manager');
  
  
      // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
      const newURL = '/คืนเงินผ่อนทรัพย์.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                     '&fname=' + encodeURIComponent(firstName) +
                     '&lname=' + encodeURIComponent(lastName)+
                     '&manager=' + encodeURIComponent(manager);
  
      
      // นำ URL ใหม่ไปที่หน้าที่ต้องการ
      window.location.href = newURL;
  }
  
  
  
  //เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มส่วนเเบ่ง
  function redirectToContractPage4() {
      const urlParams = new URLSearchParams(window.location.search);
      const idCardNumber = urlParams.get('id_card_number');
      const firstName = urlParams.get('fname');
      const lastName = urlParams.get('lname');
      const manager = urlParams.get('manager');
  
  
      // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
      const newURL = '/ส่วนเเบ่งผ่อนทรัพย์.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                     '&fname=' + encodeURIComponent(firstName) +
                     '&lname=' + encodeURIComponent(lastName)+
                     '&manager=' + encodeURIComponent(manager);
  
      
      // นำ URL ใหม่ไปที่หน้าที่ต้องการ
      window.location.href = newURL;
  }
  
  
  //เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มกำไร/ขาดทุน
  function redirectToContractPage5() {
      const urlParams = new URLSearchParams(window.location.search);
      const idCardNumber = urlParams.get('id_card_number');
      const firstName = urlParams.get('fname');
      const lastName = urlParams.get('lname');
      const manager = urlParams.get('manager');
  
  
      // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
      const newURL = '/กำไรขาดทุนผ่อนทรัพย์.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                     '&fname=' + encodeURIComponent(firstName) +
                     '&lname=' + encodeURIComponent(lastName)+
                     '&manager=' + encodeURIComponent(manager);
  
      
      // นำ URL ใหม่ไปที่หน้าที่ต้องการ
      window.location.href = newURL;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  async function fetchLoanInfo(id_card_number) {
    try {
        // ดึง creditorId จาก localStorage
        const creditorId = localStorage.getItem('id_shop');
        
        if (!creditorId) {
            throw new Error('Creditor ID not found in localStorage');
        }
  
        // ส่ง creditorId ไปกับ URL
        const response = await fetch(`/api/loaninfo/${id_card_number}?creditorId=${creditorId}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
        const loanData = await response.json();
        const loanTableBody = document.getElementById('loanTableBody');
        loanTableBody.innerHTML = '';
  
        loanData.forEach(loan => {
            // คำนวณผลรวมของ total_refund2 ทั้งหมดใน refundDocuments
            const totalRefundSum = loan.refundDocuments.reduce((total, doc) => total + parseFloat(doc.total_refund2), 0);
  
            // คำนวณ netProfit
            const netProfit = totalRefundSum
            - (loan.principal || 0)
            - (loan.recommended || 0)
            - (loan.totalShare || 0);
  
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.contract_number}</td>
                <td>${totalRefundSum}</td>
                <td>${loan.principal}</td>
                <td>${loan.recommended}</td>
                <td>${loan.totalShare}</td>
                <td>${loan.status}</td>
                <td>${netProfit}</td>
            `;
            loanTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching loan information:', error);
    }
  }
  
  
    // ฟังก์ชันสำหรับดึงพารามิเตอร์จาก URL
    function getParameterByName(name, url = window.location.href) {
      name = name.replace(/[\[\]]/g, '\\$&');
      const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
      const results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
  
    // ดึงค่า id_card_number จาก URL
    const idCardNumber = getParameterByName('id_card_number');
  
    // เรียกใช้ฟังก์ชัน fetchLoanInfo ด้วยค่า id_card_number ที่ดึงมาได้
    if (idCardNumber) {
      fetchLoanInfo(idCardNumber);
    } else {
      console.error('ไม่พบพารามิเตอร์ id_card_number ใน URL');
    }