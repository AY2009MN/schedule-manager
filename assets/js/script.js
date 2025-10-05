// مدير الجدول الدراسي - JavaScript
class ScheduleManager {
    constructor() {
        this.schedule = this.loadFromStorage() || {};
        this.timeSlots = [
            '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
        ];
        this.days = [
            'sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'
        ];
        this.dayNames = {
            'sunday': 'الأحد',
            'monday': 'الاثنين',
            'tuesday': 'الثلاثاء',
            'wednesday': 'الأربعاء',
            'thursday': 'الخميس',
            'friday': 'الجمعة',
            'saturday': 'السبت'
        };
        this.subjectColors = {
            'math': 'math',
            'mathematics': 'math',
            'رياضيات': 'math',
            'science': 'science',
            'علوم': 'science',
            'physics': 'science',
            'فيزياء': 'science',
            'chemistry': 'science',
            'كيمياء': 'science',
            'biology': 'science',
            'أحياء': 'science',
            'english': 'english',
            'إنجليزي': 'english',
            'انجليزي': 'english',
            'arabic': 'arabic',
            'عربي': 'arabic',
            'لغة عربية': 'arabic',
            'history': 'history',
            'تاريخ': 'history',
            'geography': 'geography',
            'جغرافيا': 'geography',
            'art': 'art',
            'فن': 'art',
            'رسم': 'art',
            'sport': 'sport',
            'رياضة': 'sport',
            'بدنية': 'sport'
        };
        this.currentEditingCell = null;
        this.init();
    }

    init() {
        this.initializeTable();
        this.bindEvents();
        this.updateStatistics();
        this.showWelcomeMessage();
    }

    initializeTable() {
        const tbody = document.getElementById('scheduleBody');
        tbody.innerHTML = '';

        this.timeSlots.forEach(time => {
            const row = document.createElement('tr');
            
            // خلية الوقت
            const timeCell = document.createElement('td');
            timeCell.className = 'fw-bold text-primary';
            timeCell.textContent = this.formatTime(time);
            row.appendChild(timeCell);

            // خلايا الأيام
            this.days.forEach(day => {
                const cell = document.createElement('td');
                cell.className = 'schedule-slot';
                cell.dataset.day = day;
                cell.dataset.time = time;
                
                const scheduleKey = `${day}-${time}`;
                if (this.schedule[scheduleKey]) {
                    this.fillCell(cell, this.schedule[scheduleKey]);
                } else {
                    this.setEmptyCell(cell);
                }
                
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });
    }

    fillCell(cell, classData) {
        // التحقق من صيغة البيانات الجديدة والقديمة
        let subject, teacher;
        if (typeof classData === 'string') {
            // البيانات القديمة (فقط اسم المادة)
            subject = classData;
            teacher = '';
        } else {
            // البيانات الجديدة (كائن يحتوي على المادة والمدرس)
            subject = classData.subject || classData;
            teacher = classData.teacher || '';
        }
        
        cell.className = 'schedule-cell ' + this.getSubjectClass(subject);
        cell.innerHTML = `
            <div class="cell-controls">
                <button class="btn btn-sm btn-warning" onclick="scheduleManager.editClass('${cell.dataset.day}', '${cell.dataset.time}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="scheduleManager.removeClass('${cell.dataset.day}', '${cell.dataset.time}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="text-center">
                <strong>${subject}</strong>
                ${teacher ? `<br><small>أ. ${teacher}</small>` : ''}
            </div>
        `;
        const tooltipText = teacher ? `${subject} - أ. ${teacher}` : subject;
        cell.title = `${tooltipText} - ${this.dayNames[cell.dataset.day]} ${this.formatTime(cell.dataset.time)}`;
    }

    setEmptyCell(cell) {
        cell.className = 'schedule-slot empty-cell';
        cell.innerHTML = '<span class="guide-text">فارغ</span>';
        cell.title = `إضافة حصة - ${this.dayNames[cell.dataset.day]} ${this.formatTime(cell.dataset.time)}`;
        cell.onclick = () => this.quickAdd(cell.dataset.day, cell.dataset.time);
    }

    getSubjectClass(subject) {
        const lowerSubject = subject.toLowerCase();
        for (const [key, className] of Object.entries(this.subjectColors)) {
            if (lowerSubject.includes(key.toLowerCase())) {
                return className;
            }
        }
        return 'math'; // افتراضي
    }

    formatTime(time) {
        const hour = parseInt(time.split(':')[0]);
        if (hour === 12) {
            return '12:00 ظهراً';
        } else if (hour >= 16 && hour < 18) {
            return `${hour - 12}:00 عصراً`;
        } else if (hour >= 18) {
            return `${hour - 12}:00 مساءً`;
        } else if (hour > 12) {
            return `${hour - 12}:00 عصراً`;
        } else {
            return `${hour}:00 صباحاً`;
        }
    }

    bindEvents() {
        // نموذج إضافة حصة
        document.getElementById('classForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addClass();
        });

        // أزرار الإعدادات السريعة
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportSchedule();
        });

        document.getElementById('printBtn').addEventListener('click', () => {
            this.printSchedule();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareSchedule();
        });

        // أزرار استيراد البيانات
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importData(file);
                e.target.value = ''; // إعادة تعيين المدخل
            }
        });

        // أزرار إدارة ملفات الفريق
        document.getElementById('saveToFileBtn').addEventListener('click', () => {
            this.saveToTeamFile();
        });

        document.getElementById('loadFromFileBtn').addEventListener('click', () => {
            document.getElementById('teamFile').click();
        });

        document.getElementById('teamFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadFromTeamFile(file);
                e.target.value = ''; // إعادة تعيين المدخل
            }
        });

        document.getElementById('createTemplateBtn').addEventListener('click', () => {
            this.createEmptyTemplate();
        });

        // نموذج التعديل
        document.getElementById('saveEditBtn').addEventListener('click', () => {
            this.saveEdit();
        });

        // تنظيف النموذج عند إغلاق المودال
        document.getElementById('editModal').addEventListener('hidden.bs.modal', () => {
            this.currentEditingCell = null;
        });
    }

    addClass() {
        const day = document.getElementById('daySelect').value;
        const time = document.getElementById('timeSelect').value;
        const subject = document.getElementById('subjectInput').value.trim();
        const teacher = document.getElementById('teacherInput').value.trim();

        if (!day || !time || !subject || !teacher) {
            this.showAlert('يرجى ملء جميع الحقول', 'warning');
            return;
        }

        const scheduleKey = `${day}-${time}`;
        const classData = {
            subject: subject,
            teacher: teacher
        };

        if (this.schedule[scheduleKey]) {
            const existingClass = this.schedule[scheduleKey];
            const existingSubject = typeof existingClass === 'string' ? existingClass : existingClass.subject;
            if (!confirm(`هناك حصة ${existingSubject} في هذا الوقت. هل تريد استبدالها؟`)) {
                return;
            }
        }

        this.schedule[scheduleKey] = classData;
        this.saveToStorage();
        this.initializeTable();
        this.updateStatistics();
        this.resetForm();
        this.showAlert(`تم إضافة حصة ${subject} مع الأستاذ ${teacher} يوم ${this.dayNames[day]} في ${this.formatTime(time)}`, 'success');
    }

    quickAdd(day, time) {
        const subject = prompt(`إضافة حصة يوم ${this.dayNames[day]} في ${this.formatTime(time)}:\nأدخل اسم المادة:`);
        if (subject && subject.trim()) {
            const teacher = prompt(`أدخل اسم المدرس للمادة "${subject.trim()}":`);
            if (teacher && teacher.trim()) {
                const scheduleKey = `${day}-${time}`;
                const classData = {
                    subject: subject.trim(),
                    teacher: teacher.trim()
                };
                this.schedule[scheduleKey] = classData;
                this.saveToStorage();
                this.initializeTable();
                this.updateStatistics();
                this.showAlert(`تم إضافة حصة ${subject.trim()} مع الأستاذ ${teacher.trim()}`, 'success');
            }
        }
    }

    editClass(day, time) {
        const scheduleKey = `${day}-${time}`;
        const currentClass = this.schedule[scheduleKey];

        if (!currentClass) return;

        this.currentEditingCell = { day, time, key: scheduleKey };

        // التعامل مع البيانات القديمة والجديدة
        let subject, teacher;
        if (typeof currentClass === 'string') {
            subject = currentClass;
            teacher = '';
        } else {
            subject = currentClass.subject || '';
            teacher = currentClass.teacher || '';
        }

        // ملء نموذج التعديل
        document.getElementById('editSubject').value = subject;
        document.getElementById('editTeacher').value = teacher;
        document.getElementById('editDay').value = day;
        document.getElementById('editTime').value = time;

        // إظهار المودال
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    }

    saveEdit() {
        if (!this.currentEditingCell) return;

        const newSubject = document.getElementById('editSubject').value.trim();
        const newTeacher = document.getElementById('editTeacher').value.trim();
        const newDay = document.getElementById('editDay').value;
        const newTime = document.getElementById('editTime').value;

        if (!newSubject || !newTeacher) {
            this.showAlert('يرجى ملء جميع الحقول', 'warning');
            return;
        }

        // حذف الحصة القديمة
        delete this.schedule[this.currentEditingCell.key];

        // إضافة الحصة الجديدة
        const newKey = `${newDay}-${newTime}`;
        const newClassData = {
            subject: newSubject,
            teacher: newTeacher
        };
        
        if (this.schedule[newKey] && newKey !== this.currentEditingCell.key) {
            const existingClass = this.schedule[newKey];
            const existingSubject = typeof existingClass === 'string' ? existingClass : existingClass.subject;
            if (!confirm(`هناك حصة ${existingSubject} في الوقت الجديد. هل تريد استبدالها؟`)) {
                // استعادة الحصة القديمة
                this.schedule[this.currentEditingCell.key] = {
                    subject: document.getElementById('editSubject').defaultValue || newSubject,
                    teacher: document.getElementById('editTeacher').defaultValue || newTeacher
                };
                return;
            }
        }

        this.schedule[newKey] = newClassData;
        this.saveToStorage();
        this.initializeTable();
        this.updateStatistics();

        // إغلاق المودال
        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        modal.hide();

        this.showAlert('تم تحديث الحصة بنجاح', 'success');
    }

    removeClass(day, time) {
        const scheduleKey = `${day}-${time}`;
        const classData = this.schedule[scheduleKey];

        if (!classData) return;

        // التعامل مع البيانات القديمة والجديدة
        let subject;
        if (typeof classData === 'string') {
            subject = classData;
        } else {
            subject = classData.subject || 'الحصة';
        }

        if (confirm(`هل أنت متأكد من حذف حصة ${subject}؟`)) {
            delete this.schedule[scheduleKey];
            this.saveToStorage();
            this.initializeTable();
            this.updateStatistics();
            this.showAlert(`تم حذف حصة ${subject}`, 'info');
        }
    }

    clearAllData() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            this.schedule = {};
            this.saveToStorage();
            this.initializeTable();
            this.updateStatistics();
            this.resetForm();
            this.showAlert('تم مسح جميع البيانات', 'info');
        }
    }

    updateStatistics() {
        const totalClasses = Object.keys(this.schedule).length;
        const activeDays = new Set(Object.keys(this.schedule).map(key => key.split('-')[0])).size;
        const totalHours = totalClasses;

        document.getElementById('totalClasses').textContent = totalClasses;
        document.getElementById('activeDays').textContent = activeDays;
        document.getElementById('totalHours').textContent = totalHours;

        // تحديث عداد الحصص مع تأثير بصري
        if (totalClasses > 0) {
            document.getElementById('totalClasses').parentElement.classList.add('pulse');
            setTimeout(() => {
                document.getElementById('totalClasses').parentElement.classList.remove('pulse');
            }, 2000);
        }
    }

    resetForm() {
        document.getElementById('classForm').reset();
        document.getElementById('subjectInput').focus();
    }

    showAlert(message, type = 'info') {
        // إنشاء تنبيه ديناميكي
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // إزالة التنبيه تلقائياً بعد 3 ثواني
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }

    showWelcomeMessage() {
        if (Object.keys(this.schedule).length === 0) {
            setTimeout(() => {
                this.showAlert('مرحباً! ابدأ بإضافة حصصك الدراسية لتكوين جدولك الأسبوعي', 'info');
            }, 1000);
        }
    }

    exportSchedule() {
        const data = {
            schedule: this.schedule,
            exportDate: new Date().toISOString(),
            totalClasses: Object.keys(this.schedule).length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `جدول-الحصص-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showAlert('تم تصدير الجدول بنجاح', 'success');
    }

    printSchedule() {
        const printWindow = window.open('', '_blank');
        const scheduleTable = document.getElementById('scheduleTable').outerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>الجدول الدراسي</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Cairo', Arial, sans-serif; }
                    .schedule-cell { background: #f8f9fa !important; color: #212529 !important; border: 1px solid #dee2e6 !important; }
                    .cell-controls { display: none !important; }
                    @page { margin: 1cm; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="text-center mb-4">الجدول الدراسي</h1>
                    <p class="text-center mb-4">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
                    ${scheduleTable}
                    <div class="mt-4 text-center">
                        <p>إجمالي الحصص: ${Object.keys(this.schedule).length}</p>
                        <p>الأيام النشطة: ${new Set(Object.keys(this.schedule).map(key => key.split('-')[0])).size}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    shareSchedule() {
        const scheduleText = this.generateScheduleText();
        
        if (navigator.share) {
            navigator.share({
                title: 'جدولي الدراسي',
                text: scheduleText
            });
        } else {
            // نسخ النص إلى الحافظة
            navigator.clipboard.writeText(scheduleText).then(() => {
                this.showAlert('تم نسخ الجدول إلى الحافظة', 'success');
            }).catch(() => {
                // عرض النص في نافذة منبثقة كبديل
                const modal = document.createElement('div');
                modal.innerHTML = `
                    <div class="modal fade show" style="display: block;">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">مشاركة الجدول</h5>
                                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                                </div>
                                <div class="modal-body">
                                    <textarea class="form-control" rows="15" readonly>${scheduleText}</textarea>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">إغلاق</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            });
        }
    }

    generateScheduleText() {
        let text = '📅 جدولي الدراسي\n\n';
        
        this.days.forEach(day => {
            const dayClasses = Object.keys(this.schedule)
                .filter(key => key.startsWith(day))
                .sort((a, b) => a.split('-')[1].localeCompare(b.split('-')[1]));
            
            if (dayClasses.length > 0) {
                text += `📌 ${this.dayNames[day]}:\n`;
                dayClasses.forEach(key => {
                    const time = key.split('-')[1];
                    const classData = this.schedule[key];
                    
                    // التعامل مع البيانات القديمة والجديدة
                    if (typeof classData === 'string') {
                        text += `   • ${this.formatTime(time)}: ${classData}\n`;
                    } else {
                        text += `   • ${this.formatTime(time)}: ${classData.subject} - أ. ${classData.teacher}\n`;
                    }
                });
                text += '\n';
            }
        });
        
        text += `📊 الإحصائيات:\n`;
        text += `• إجمالي الحصص: ${Object.keys(this.schedule).length}\n`;
        text += `• الأيام النشطة: ${new Set(Object.keys(this.schedule).map(key => key.split('-')[0])).size}\n`;
        text += `• إجمالي الساعات: ${Object.keys(this.schedule).length}\n\n`;
        text += `📱 تم إنشاؤه بواسطة مدير الجدول الدراسي`;
        
        return text;
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem('scheduleData');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            return null;
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('scheduleData', JSON.stringify(this.schedule));
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            this.showAlert('خطأ في حفظ البيانات', 'danger');
        }
    }

    // وظائف إضافية للتحسين
    importSchedule(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.schedule) {
                    if (confirm('هل تريد استبدال الجدول الحالي بالجدول المستورد؟')) {
                        this.schedule = data.schedule;
                        this.saveToStorage();
                        this.initializeTable();
                        this.updateStatistics();
                        this.showAlert('تم استيراد الجدول بنجاح', 'success');
                    }
                } else {
                    this.showAlert('ملف غير صالح', 'danger');
                }
            } catch (error) {
                this.showAlert('خطأ في قراءة الملف', 'danger');
            }
        };
        reader.readAsText(file);
    }

    // البحث في الجدول
    searchSchedule(query) {
        const results = [];
        Object.keys(this.schedule).forEach(key => {
            const classData = this.schedule[key];
            const lowerQuery = query.toLowerCase();
            
            // البحث في المادة واسم المدرس
            let searchText = '';
            if (typeof classData === 'string') {
                searchText = classData.toLowerCase();
            } else {
                searchText = `${classData.subject} ${classData.teacher}`.toLowerCase();
            }
            
            if (searchText.includes(lowerQuery)) {
                const [day, time] = key.split('-');
                const result = {
                    day: this.dayNames[day],
                    time: this.formatTime(time)
                };
                
                if (typeof classData === 'string') {
                    result.subject = classData;
                    result.teacher = '';
                } else {
                    result.subject = classData.subject;
                    result.teacher = classData.teacher;
                }
                
                results.push(result);
            }
        });
        return results;
    }

    // وظائف إدارة ملفات البيانات للفريق
    saveToTeamFile() {
        const teamData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            teamName: "فريق العمل",
            schedule: this.schedule,
            metadata: {
                totalClasses: Object.keys(this.schedule).length,
                activeDays: new Set(Object.keys(this.schedule).map(key => key.split('-')[0])).size,
                createdBy: "مدير الجدول الدراسي",
                exportDate: new Date().toLocaleDateString('ar-SA')
            }
        };

        const dataStr = JSON.stringify(teamData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `team_schedule_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showAlert('تم حفظ ملف بيانات الفريق بنجاح! يمكنك مشاركته مع أعضاء الفريق.', 'success');
    }

    loadFromTeamFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const teamData = JSON.parse(e.target.result);
                
                // التحقق من صحة البيانات
                if (!teamData.schedule) {
                    throw new Error('ملف البيانات غير صحيح');
                }

                // حفظ البيانات الحالية كنسخة احتياطية
                const backup = { ...this.schedule };
                
                // تحميل البيانات الجديدة
                this.schedule = teamData.schedule;
                this.saveToStorage();
                this.updateScheduleDisplay();
                this.updateStats();

                // عرض معلومات الملف المحمّل
                let message = `تم تحميل بيانات الفريق بنجاح!\n\n`;
                if (teamData.metadata) {
                    message += `📊 إحصائيات الملف:\n`;
                    message += `• إجمالي الحصص: ${teamData.metadata.totalClasses}\n`;
                    message += `• الأيام النشطة: ${teamData.metadata.activeDays}\n`;
                    message += `• تاريخ الإنشاء: ${teamData.metadata.exportDate}\n`;
                }

                this.showAlert(message, 'success');

            } catch (error) {
                console.error('خطأ في تحميل ملف الفريق:', error);
                this.showAlert('خطأ في تحميل ملف البيانات. تأكد من صحة الملف وحاول مرة أخرى.', 'danger');
            }
        };
        reader.readAsText(file);
    }

    createEmptyTemplate() {
        const template = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            teamName: "فريق العمل - قالب فارغ",
            schedule: {},
            metadata: {
                totalClasses: 0,
                activeDays: 0,
                createdBy: "مدير الجدول الدراسي",
                exportDate: new Date().toLocaleDateString('ar-SA'),
                isTemplate: true,
                instructions: "هذا قالب فارغ لإنشاء جدول دراسي جديد للفريق"
            }
        };

        const dataStr = JSON.stringify(template, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `team_schedule_template_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showAlert('تم إنشاء قالب فارغ للفريق! يمكن استخدامه لبدء جدول جديد.', 'info');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // التحقق من نوع البيانات
                let scheduleData;
                if (data.schedule) {
                    // ملف فريق
                    scheduleData = data.schedule;
                } else {
                    // ملف تصدير عادي
                    scheduleData = data;
                }

                this.schedule = scheduleData;
                this.saveToStorage();
                this.updateScheduleDisplay();
                this.updateStats();

                this.showAlert('تم استيراد البيانات بنجاح!', 'success');

            } catch (error) {
                console.error('خطأ في استيراد البيانات:', error);
                this.showAlert('خطأ في استيراد البيانات. تأكد من صحة الملف.', 'danger');
            }
        };
        reader.readAsText(file);
    }

    showStatusMessage(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} status-message alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // إزالة الرسالة تلقائياً بعد 5 ثوان
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// تهيئة التطبيق عند تحميل الصفحة
let scheduleManager;

document.addEventListener('DOMContentLoaded', () => {
    scheduleManager = new ScheduleManager();
    
    // إضافة مستمع للوحة المفاتيح للاختصارات
    document.addEventListener('keydown', (e) => {
        // Ctrl + N: إضافة حصة جديدة
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            document.getElementById('subjectInput').focus();
        }
        
        // Ctrl + P: طباعة الجدول
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            scheduleManager.printSchedule();
        }
        
        // Ctrl + S: تصدير الجدول
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            scheduleManager.exportSchedule();
        }
    });
    
    // إضافة تفاعل السحب والإفلات للاستيراد
    const dropZone = document.body;
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = '';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/json') {
            scheduleManager.importSchedule(files[0]);
        }
    });
});

// وظائف مساعدة عامة
function formatArabicTime(time) {
    const hour = parseInt(time.split(':')[0]);
    if (hour === 12) {
        return '12:00 ظهراً';
    } else if (hour > 12) {
        return `${hour - 12}:00 عصراً`;
    } else {
        return `${hour}:00 صباحاً`;
    }
}

function getRandomColor() {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// معالج أخطاء JavaScript العامة
window.addEventListener('error', (e) => {
    console.error('خطأ في التطبيق:', e.error);
    // يمكن إضافة تقرير الأخطاء هنا
});

// معالج تغيير حالة الشبكة
window.addEventListener('online', () => {
    console.log('تم الاتصال بالإنترنت');
});

window.addEventListener('offline', () => {
    console.log('تم قطع الاتصال بالإنترنت');
    if (scheduleManager) {
        scheduleManager.showAlert('تم قطع الاتصال بالإنترنت - البيانات محفوظة محلياً', 'warning');
    }
});