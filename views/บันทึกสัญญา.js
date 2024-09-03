//ไอดีร้าน
document.addEventListener('DOMContentLoaded', () => {
    // ดึงค่า ID จาก localStorage
    const id = localStorage.getItem('id_shop');
    const shopName = localStorage.getItem('shop_name');
    
    // ใส่ค่า ID ลงในฟิลด์ input ที่มี id เป็น 'creditor'
    if (id) {
        document.getElementById('creditorId').value = id;
    }

    // แสดงค่า ID ในคอนโซลสำหรับการดีบัก
    console.log('ID:', id);
    console.log('Shop Name:', shopName);
    console.log('Creditor Value:', document.getElementById('creditorId').value); // ตรวจสอบค่าที่ตั้งใน input
});

// ฟังก์ชันสำหรับรับพารามิเตอร์ URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// ฟังก์ชันสำหรับดึงหมายเลขสัญญาสูงสุดจากเซิร์ฟเวอร์
async function fetchMaxContractNumber(idCardNumber) {
    try {
        // ดึง creditorId จาก localStorage
        const creditorId = localStorage.getItem('id_shop');
        
        if (!creditorId) {
            console.error('No creditorId found in localStorage');
            return 0;
        }

        // ส่ง request ไปยัง API พร้อมกับ id_card_number และ creditorId
        const response = await fetch(`/api/max-contract-number?id_card_number=${encodeURIComponent(idCardNumber)}&creditorId=${encodeURIComponent(creditorId)}`);
        const data = await response.json();
        
        // ตรวจสอบว่า maxContractNumber ไม่ใช่ null หรือ undefined
        return data.maxContractNumber || 0;
    } catch (error) {
        console.error('Error fetching max contract number:', error);
        return 0;
    }
}


// ฟังก์ชันสำหรับตั้งค่าหมายเลขสัญญาใหม่
async function setNewContractNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const contractNumberParam = urlParams.get('contract_number');
    
    if (contractNumberParam) {
        // ใช้หมายเลขสัญญาจากพารามิเตอร์ URL
        document.getElementById('contract_number').value = contractNumberParam;
    } else {
        // สร้างหมายเลขสัญญาใหม่
        const idCardNumber = document.getElementById('id_card_number').value;
        if (idCardNumber) {
            const maxContractNumber = await fetchMaxContractNumber(idCardNumber);
            const newContractNumber = parseInt(maxContractNumber, 10) + 1; // เพิ่มค่า +1 จากหมายเลขสัญญาสูงสุด
            document.getElementById('contract_number').value = newContractNumber;
        }
    }
}

// เรียกใช้ฟังก์ชันตั้งค่าหมายเลขสัญญาใหม่เมื่อโหลดหน้าหรือเมื่อจำเป็น
window.onload = function() {
    setNewContractNumber();
};


// กำหนดค่า id_card_number จากพารามิเตอร์ URL
window.onload = function() {
    console.log('window.onload เรียกใช้');
    const idCardNumber = getUrlParameter('id_card_number');
    const fname = getUrlParameter('fname');
    const lname = getUrlParameter('lname');
    const manager = getUrlParameter('manager');
    const billNumber = getUrlParameter('bill_number');

    if (idCardNumber) {
        console.log('พารามิเตอร์ id_card_number พบ:', idCardNumber);
        document.getElementById('id_card_number').value = idCardNumber;
        setNewContractNumber(); // เรียกใช้ฟังก์ชันตั้งค่าหมายเลขสัญญา
    } else {
        console.log('ไม่พบพารามิเตอร์ URL id_card_number');
    }

    if (fname) {
        console.log('พารามิเตอร์ fname พบ:', fname);
        document.getElementById('fname').value = fname;
    } else {
        console.log('ไม่พบพารามิเตอร์ URL fname');
    }

    if (lname) {
        console.log('พารามิเตอร์ lname พบ:', lname);
        document.getElementById('lname').value = lname;
    } else {
        console.log('ไม่พบพารามิเตอร์ URL lname');
    }

    if (manager) {
        console.log('พารามิเตอร์ manager พบ:', manager);
        document.getElementById('manager').value = manager;
    } else {
        console.log('ไม่พบพารามิเตอร์ URL manager');
    }
    if (billNumber) {
        console.log('พารามิเตอร์ bill_number พบ:', billNumber);
        document.getElementById('bill_number').value = billNumber;
    } else {
        console.log('ไม่พบพารามิเตอร์ URL bill_number');
        // ตั้งค่าหมายเลขบิลเป็น 1 ถ้าไม่มีพารามิเตอร์
        document.getElementById('bill_number').value = 1;
    }

    

    // แสดงวันที่ปัจจุบัน
    function setLoanDate() {
        var today = new Date();
        var month = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : today.getMonth() + 1;
        var day = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
        document.getElementById('loanDate').value = today.getFullYear() + '-' + month + '-' + day;
    }

    
    // เรียกใช้ฟังก์ชัน setLoanDate เมื่อหน้าเว็บโหลดเสร็จสมบูรณ์
    setLoanDate();

    // คำนวณระยะเวลากู้
    document.getElementById('loanDate').addEventListener('change', calculateLoanPeriod);
    document.getElementById('returnDate').addEventListener('change', calculateLoanPeriod);

    function calculateLoanPeriod() {
        var loanDate = new Date(document.getElementById('loanDate').value);
        var returnDate = new Date(document.getElementById('returnDate').value);
        var timeDiff = Math.abs(returnDate.getTime() - loanDate.getTime());
        var loanPeriod = Math.ceil(timeDiff / (1000 * 3600 * 24)); // แปลงมิลลิวินาทีเป็นวันและปัดขึ้น
        document.getElementById('loanPeriod').value = loanPeriod;
    }

    // คำนวณวันคืน
    document.getElementById('loanDate').addEventListener('change', calculateReturnDate);
    document.getElementById('loanPeriod').addEventListener('input', calculateReturnDate);

    function calculateReturnDate() {
        var loanDate = new Date(document.getElementById('loanDate').value);
        var loanPeriod = parseInt(document.getElementById('loanPeriod').value);
        
        if (!isNaN(loanPeriod)) {
            var returnDate = new Date(loanDate.getTime() + (loanPeriod * 24 * 60 * 60 * 1000));
            var year = returnDate.getFullYear();
            var month = (returnDate.getMonth() + 1 < 10) ? '0' + (returnDate.getMonth() + 1) : returnDate.getMonth() + 1;
            var day = (returnDate.getDate() < 10) ? '0' + returnDate.getDate() : returnDate.getDate();
            var formattedReturnDate = year + '-' + month + '-' + day;
            document.getElementById('returnDate').value = formattedReturnDate;
        }
    }

    // คำนวณดอกเบี้ยทั้งหมดและเงินที่ต้องคืน
    function calculateInterest() {
        var principal = parseFloat(document.getElementById('principal').value); // เงินต้น
        var duration = parseInt(document.getElementById('loanPeriod').value); // ระยะเวลากู้ (วัน)
        var interestRate = parseFloat(document.getElementById('interestRate').value); // อัตราดอกเบี้ยต่อวัน (%)
    
        if (isNaN(principal) || isNaN(duration) || isNaN(interestRate)) {
            document.getElementById('totalInterest').value = ''; // เคลียร์ค่าใน input field "ดอกเบี้ยทั้งหมด"
            document.getElementById('totalRefund').value = ''; // เคลียร์ค่าใน input field "เงินที่ต้องคืนทั้งหมด"
            return;
        }
    
        var dailyInterest = (principal * interestRate) / 100;
        var totalInterest = dailyInterest * duration;
    
        document.getElementById('totalInterest').value = totalInterest;
    
        var totalPayment = principal + totalInterest;
    
        document.getElementById('totalRefund').value = totalPayment;
    }

    document.getElementById('principal').addEventListener('input', calculateInterest);
    document.getElementById('loanPeriod').addEventListener('input', calculateInterest);
    document.getElementById('interestRate').addEventListener('input', calculateInterest);
};













//เลือกประเภทการกู้
function toggleFields() {
    var loanType = document.getElementById("loanType").value;
    var storeAssetsFields = document.getElementById("storeAssetsFields");
    var icloudAssetsFields = document.getElementById("icloudAssetsFields");

    var icloudFields = [
        document.getElementById("phoneicloud"),
        document.getElementById("email_icloud"),
        document.getElementById("code_icloud2"),
        document.getElementById("code_icloud"),
        document.getElementById("icloud_assets"),
        document.getElementById("icloud_asset_photo")
    ];

    var storeFields = [
        document.getElementById("store_assets"),
        document.getElementById("asset_receipt_photo")
    ];

    if (loanType === "loanCash") {
        icloudAssetsFields.style.display = "block";
        storeAssetsFields.style.display = "none";
        icloudFields.forEach(function(field) {
            field.setAttribute("required", "true");
        });
        storeFields.forEach(function(field) {
            field.removeAttribute("required");
        });
    } else if (loanType === "loanProperty") {
        icloudAssetsFields.style.display = "none";
        storeAssetsFields.style.display = "block";
        icloudFields.forEach(function(field) {
            field.removeAttribute("required");
        });
        storeFields.forEach(function(field) {
            field.setAttribute("required", "true");
        });
    } else {
        icloudAssetsFields.style.display = "none";
        storeAssetsFields.style.display = "none";
        icloudFields.forEach(function(field) {
            field.removeAttribute("required");
        });
        storeFields.forEach(function(field) {
            field.removeAttribute("required");
        });
    }
}





document.addEventListener('DOMContentLoaded', function() {
    const phoneSelect = document.getElementById('phoneicloud');
    const emailSelect = document.getElementById('email_icloud');
    const codeInput = document.getElementById('code_icloud2');

    // ดึง creditorId จาก localStorage
    const creditorId = localStorage.getItem('id_shop');

    if (!creditorId) {
        console.error('Creditor ID is not available in localStorage');
        return; // Exit if creditorId is not available
    }

    // เบอร์โทรศัพท์ไอคราวร้าน
    fetch(`/api/phone_number?creditorId=${creditorId}`)
        .then(response => response.json())
        .then(phoneNumbers => {
            phoneNumbers.forEach(record => {
                const option = document.createElement('option');
                option.value = record.phone_number;
                option.textContent = record.phone_number;
                phoneSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching phone numbers:', error));

    // Event listener for phoneSelect change
    phoneSelect.addEventListener('change', function() {
        const selectedPhoneNumber = phoneSelect.value;

        // Clear previous email options
        emailSelect.innerHTML = '<option value="">เลือกยูสไอคราวร้าน</option>';

        // อีเมลไอคราวร้าน
        fetch(`/api/user_email?phone_number=${selectedPhoneNumber}&creditorId=${creditorId}`)
            .then(response => response.json())
            .then(userEmails => {
                const filteredEmails = userEmails.filter(record => record.phone_number === selectedPhoneNumber);
                filteredEmails.forEach(record => {
                    const option = document.createElement('option');
                    option.value = record.user_email;
                    option.textContent = record.user_email;
                    emailSelect.appendChild(option);
                });

                // Trigger displayIcloudPassword function initially with default selected values
                displayIcloudPassword(selectedPhoneNumber, emailSelect.value);
            })
            .catch(error => console.error('Error fetching user emails:', error));
    });

    // Event listener for emailSelect change
    emailSelect.addEventListener('change', function() {
        const selectedPhoneNumber = phoneSelect.value;
        const selectedUserEmail = emailSelect.value;

        // Fetch and display iCloud password
        displayIcloudPassword(selectedPhoneNumber, selectedUserEmail);
    });

    // รหัสไอคราวส่งให้ลูกหนี้
    function displayIcloudPassword(phoneNumber, userEmail) {
        // Check if phoneNumber and userEmail are both defined
        if (!phoneNumber || !userEmail) {
            console.error('Phone number or user email is not defined');
            return; // Exit the function early if either value is not defined
        }

        fetch(`/api/icloud_password/${phoneNumber}/${userEmail}?creditorId=${creditorId}`)
            .then(response => response.text())
            .then(data => {
                codeInput.value = data;  // Set the retrieved password in the input field
            })
            .catch(error => console.error('Error fetching iCloud password:', error));
    }
});




// อัปเดตรหัสไอคราวที่พึ่งบันทึก
async function updateIcloudPassword() {
    const phoneIcloud = document.getElementById('phoneicloud').value;
    const emailIcloud = document.getElementById('email_icloud').value;
    const codeIcloud = document.getElementById('code_icloud').value;
    const creditorId = localStorage.getItem('id_shop'); // ดึง creditorId จาก localStorage
    
    if (phoneIcloud && emailIcloud && codeIcloud && creditorId) {
        // ส่งข้อมูลไปที่ backend เพื่อทำการอัปเดต
        try {
            const response = await fetch(`/updateIcloudPassword?creditorId=${creditorId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneicloud: phoneIcloud,
                    email_icloud: emailIcloud,
                    code_icloud: codeIcloud
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('อัปเดตสำเร็จ:', result);
            } else {
                const errorResult = await response.json();
                console.error('เกิดข้อผิดพลาดในการอัปเดต:', errorResult);
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
        }
    } else {
        console.error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('code_icloud').addEventListener('change', updateIcloudPassword);
});











//เเสดงไฟล์ภาพที่กำลังบันทึก
function handleFileSelect(event) {
    const input = event.target;
    const file = input.files[0];
    const preview = document.getElementById(input.id + '_preview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block'; // แสดงภาพ
        };
        reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL
    } else {
        preview.src = '';
        preview.style.display = 'none'; // ซ่อนภาพ
    }
}

// เพิ่ม event listeners ให้กับ input file
document.getElementById('refund_receipt_photo').addEventListener('change', handleFileSelect);
document.getElementById('contract').addEventListener('change', handleFileSelect);
document.getElementById('Recommended_photo').addEventListener('change', handleFileSelect);
document.getElementById('asset_receipt_photo').addEventListener('change', handleFileSelect);
document.getElementById('icloud_asset_photo').addEventListener('change', handleFileSelect);












document.addEventListener('DOMContentLoaded', async function() {
    try {
        // ดึง creditorId จาก localStorage
        const creditorId = localStorage.getItem('id_shop');
        const urlParams = new URLSearchParams(window.location.search);
        const loanId = urlParams.get('loan_id');

        if (loanId) {
            // ดึงข้อมูลสัญญา
            const response = await fetch(`/api/loanss/${loanId}`);
            const data = await response.json();

            // การกรอกข้อมูลในฟอร์ม
            document.getElementById('manager').value = data.manager;
            document.getElementById('id_card_number').value = data.id_card_number;
            document.getElementById('fname').value = data.fname;
            document.getElementById('lname').value = data.lname;
            document.getElementById('contract_number').value = data.contract_number;
            document.getElementById('bill_number').value = data.bill_number;

            // ตั้งค่า loanType และเรียกใช้ toggleFields()
            const loanTypeField = document.getElementById('loanType');
            loanTypeField.value = data.loanType;
            toggleFields(); // เรียกใช้เพื่อจัดการการแสดงผลของฟิลด์ที่เกี่ยวข้อง

            // ตั้งค่า phoneicloud เป็นตัวเลือก (dropdown)
            const phoneSelect = document.getElementById('phoneicloud');
            phoneSelect.innerHTML = ''; // ล้างตัวเลือกก่อน

            // ดึงข้อมูลเบอร์โทรศัพท์จาก API โดยใช้ creditorId
            const phoneApiUrl = new URL('/api/phone_number', window.location.origin);
            if (creditorId) phoneApiUrl.searchParams.append('creditorId', creditorId);

            const phoneResponse = await fetch(phoneApiUrl);
            const phoneNumbers = await phoneResponse.json();

            phoneNumbers.forEach(record => {
                const option = document.createElement('option');
                option.value = record.phone_number;
                option.textContent = record.phone_number;
                phoneSelect.appendChild(option);
            });

            // ตั้งค่าให้ select มีค่าเป็น phoneicloud ที่ได้รับจากฐานข้อมูล
            if (data.phoneicloud) {
                phoneSelect.value = data.phoneicloud;
            }

            // ตรวจสอบและตั้งค่า email_icloud
            const emailSelect = document.getElementById('email_icloud');
            emailSelect.innerHTML = ''; // ล้างตัวเลือกก่อน
            if (data.email_icloud) {
                const option = document.createElement('option');
                option.value = data.email_icloud;
                option.textContent = data.email_icloud;
                emailSelect.appendChild(option);
                emailSelect.value = data.email_icloud; // ตั้งค่าให้ select มีค่าเป็น email_icloud ที่ได้รับ
            }

            document.getElementById('code_icloud2').value = data.code_icloud2 || '';
            document.getElementById('code_icloud').value = data.code_icloud || '';
            document.getElementById('icloud_assets').value = data.icloudAssets || '';
            document.getElementById('loanDate').value = data.loanDate || '';
            document.getElementById('loanPeriod').value = data.loanPeriod || '';
            document.getElementById('returnDate').value = data.returnDate || '';
            document.getElementById('principal').value = data.principal || '';
            document.getElementById('interestRate').value = data.interestRate || '';
            document.getElementById('totalInterest').value = data.totalInterest || '';
            document.getElementById('totalRefund').value = data.totalRefund || '';
            document.getElementById('manager2').value = data.manager2 || '';
            document.getElementById('Recommended').value = data.Recommended || '';
        }

        // Event listener for phoneSelect change
        const phoneSelect = document.getElementById('phoneicloud');
        phoneSelect.addEventListener('change', function() {
            const selectedPhoneNumber = phoneSelect.value;
            console.log('Selected phone number:', selectedPhoneNumber);
        });
    } catch (error) {
        console.error('Failed to fetch loan data or phone numbers:', error);
    }


    // Event listener for phoneSelect change
    const phoneSelect = document.getElementById('phoneicloud');
    phoneSelect.addEventListener('change', function() {
        const selectedPhoneNumber = phoneSelect.value;
        console.log('Selected phone number:', selectedPhoneNumber);
    });
});
















// แสดงข้อมูลไฟล์ภาพที่ถูกบันทึกแล้ว
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const loan_id = urlParams.get('loan_id');

    if (loan_id) {
        fetch(`/loan_id2/${loan_id}`)
            .then(response => response.json())
            .then(data => {
                // ตรวจสอบและแสดงข้อมูลลูกหนี้
                if (data.icloud_asset_photo_base64 && data.icloud_asset_photo_base64.length > 0) {
                    document.getElementById('icloud_asset_photo_preview').src = data.icloud_asset_photo_base64[0];
                    document.getElementById('icloud_asset_photo_preview').style.display = 'block';
                }
                if (data.asset_receipt_photo_base64 && data.asset_receipt_photo_base64.length > 0) {
                    document.getElementById('asset_receipt_photo_preview').src = data.asset_receipt_photo_base64[0];
                    document.getElementById('asset_receipt_photo_preview').style.display = 'block';
                }
                if (data.refund_receipt_photo_base64 && data.refund_receipt_photo_base64.length > 0) {
                    document.getElementById('refund_receipt_photo_preview').src = data.refund_receipt_photo_base64[0];
                    document.getElementById('refund_receipt_photo_preview').style.display = 'block';
                }
                if (data.contract_base64 && data.contract_base64.length > 0) {
                    document.getElementById('contract_preview').src = data.contract_base64[0];
                    document.getElementById('contract_preview').style.display = 'block';
                }
                if (data.Recommended_photo_base64 && data.Recommended_photo_base64.length > 0) {
                    document.getElementById('Recommended_photo_preview').src = data.Recommended_photo_base64[0];
                    document.getElementById('Recommended_photo_preview').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error fetching loan data:', error);
            });
    }
});




