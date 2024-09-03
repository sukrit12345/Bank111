
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









//สร้างวันที่ปัจจุบัน
// เรียกฟังก์ชัน setDate เมื่อหน้าเว็บโหลด
window.onload = setDate;

function setDate() {
      // สร้างวันที่ปัจจุบัน
      var today = new Date();

      // หากเดือนหรือวันเป็นเลขเดียว ให้เพิ่ม "0" ข้างหน้า
      var month = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : today.getMonth() + 1;
      var day = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();

      // กำหนดค่าวันที่ให้กับ input element "return_date_input"
      document.getElementById('date').value = today.getFullYear() + '-' + month + '-' + day;
}



//ตรวจสอบว่าใส่เลขบัตรครบมั้ย
function validateForm(event) {
    var input = document.getElementById('id_card_number');
    var errorSpan = document.getElementById('idCardError');
    // ตรวจสอบว่าข้อมูลที่ป้อนเข้ามาเป็นตัวเลขและมีความยาว 13 หลัก
    var numericInput = /^[0-9]+$/;
    if (!input.value.match(numericInput) || input.value.length !== 13) {
        // แสดงข้อความเตือน
        errorSpan.textContent = "กรุณากรอกเลขบัตรประชาชนให้ถูกต้อง (13 หลักเป็นตัวเลขเท่านั้น)";
        // ยกเลิกการส่งแบบฟอร์ม
        event.preventDefault();
        return false;
    } else {
        // ล้างข้อความเตือนเมื่อข้อมูลถูกต้อง
        errorSpan.textContent = "";
        // ส่งแบบฟอร์ม
        return true;
    }
}






//เเสดงข้อมูลที่ถูกบันทึกเเล้ว
document.addEventListener('DOMContentLoaded', function() {
    // ดึง creditorId จาก localStorage
    const creditorId = localStorage.getItem('id_shop');

    if (!creditorId) {
        console.error('No creditorId found in localStorage');
        return;
    }

    // ดึงรายชื่อแอดมินและเติมลงใน select field
    fetch(`/api/managers?creditorId=${encodeURIComponent(creditorId)}`)
        .then(response => response.json())
        .then(data => {
            const managerSelect = document.getElementById('manager');

            // เติมตัวเลือกแอดมินลงใน select field
            data.forEach(manager => {
                const option = document.createElement('option');
                option.value = manager.nickname;
                option.textContent = manager.nickname;
                managerSelect.appendChild(option);
            });
            // หลังจากเติมตัวเลือกแล้ว ดึงข้อมูลลูกหนี้ถ้ามี debtorId
            const urlParams = new URLSearchParams(window.location.search);
            const debtorId = urlParams.get('id');
            if (debtorId) {
                fetch(`/api/debtor/${debtorId}`)
                    .then(response => response.json())
                    .then(debtor => {
                        document.getElementById('date').value = debtor.date;
                        document.getElementById('id_card_number').value = debtor.id_card_number;
                        document.getElementById('fname').value = debtor.fname;
                        document.getElementById('lname').value = debtor.lname;
                        document.getElementById('occupation').value = debtor.occupation;
                        document.getElementById('monthly_income_amount').value = debtor.monthly_income_amount;
                        document.getElementById('seizable_assets_description').value = debtor.seizable_assets_description;
                        document.getElementById('ig').value = debtor.ig;
                        document.getElementById('facebook').value = debtor.facebook;
                        document.getElementById('line').value = debtor.line;
                        document.getElementById('phone').value = debtor.phone;
                        document.getElementById('province').value = debtor.province;
                        document.getElementById('currentAddress').value = debtor.currentAddress;
                        document.getElementById('workOrStudyAddress').value = debtor.workOrStudyAddress;
                        document.getElementById('workOrStudyAddress2').value = debtor.workOrStudyAddress2;
                        document.getElementById('grade').value = debtor.grade;
                        document.getElementById('course').value = debtor.course;

                        // ตั้งค่าตัวเลือกที่ตรงกับค่า debtor.manager
                        const options = managerSelect.options;
                        for (let i = 0; i < options.length; i++) {
                            if (options[i].value === debtor.manager) {
                                options[i].selected = true;
                                break;
                            }
                        }
                    })
                    .catch(error => console.error('Error fetching debtor data:', error));
            }
        })
        .catch(error => console.error('Error:', error));
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
    document.getElementById('id_card_photo').addEventListener('change', handleFileSelect);
    document.getElementById('id_card_photo2').addEventListener('change', handleFileSelect);
    document.getElementById('student_record_photo').addEventListener('change', handleFileSelect);
    document.getElementById('timetable_photo').addEventListener('change', handleFileSelect);
    document.getElementById('current_address_map').addEventListener('change', handleFileSelect);
    document.getElementById('work_address_map').addEventListener('change', handleFileSelect);




    



    
//เเสดงข้อมูลไฟล์ภาพที่ถูกบันทึกเเล้ว
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const debtorId = urlParams.get('id');

    if (debtorId) {
        fetch(`/debtorinfo/${debtorId}`)
            .then(response => response.json())
            .then(data => {
                // แสดงข้อมูลลูกหนี้
                
                if (data.id_card_photo_base64) {
                    document.getElementById('id_card_photo_preview').src = data.id_card_photo_base64;
                    document.getElementById('id_card_photo_preview').style.display = 'block';
                }
                if (data.id_card_photo2_base64) {
                    document.getElementById('id_card_photo2_preview').src = data.id_card_photo2_base64;
                    document.getElementById('id_card_photo2_preview').style.display = 'block';
                }
                if (data.student_record_photo_base64) {
                    document.getElementById('student_record_photo_preview').src = data.student_record_photo_base64;
                    document.getElementById('student_record_photo_preview').style.display = 'block';
                }
                if (data.timetable_photo_base64) {
                    document.getElementById('timetable_photo_preview').src = data.timetable_photo_base64;
                    document.getElementById('timetable_photo_preview').style.display = 'block';
                }
                if (data.current_address_map_base64) {
                    document.getElementById('current_address_map_preview').src = data.current_address_map_base64;
                    document.getElementById('current_address_map_preview').style.display = 'block';
                }
                if (data.work_address_map_base64) {
                    document.getElementById('work_address_map_preview').src = data.work_address_map_base64;
                    document.getElementById('work_address_map_preview').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error fetching debtor data:', error);
            });
    }
});


    

