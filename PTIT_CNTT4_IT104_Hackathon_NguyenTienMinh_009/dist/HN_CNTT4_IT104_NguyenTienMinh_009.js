"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Course {
    constructor(courseId, courseName, price, duration) {
        this.students = 0;
        this.courseId = courseId;
        this.courseName = courseName;
        this.price = price;
        this.duration = duration;
    }
    displayCourse() {
        console.log(`#${this.courseId} | ${this.courseName} | Giá: ${this.price} | Thời lượng: ${this.duration} | Học viên: ${this.students}`);
    }
    getCourse(discount) {
        this.students++;
        let cost = this.price;
        if (discount)
            cost = Math.round(this.price * (1 - discount / 100));
        return `Mua khóa học ${this.courseName} với giá ${cost}`;
    }
}
class FreeCourse extends Course {
    constructor(courseId, courseName, duration) {
        super(courseId, courseName, 0, duration);
    }
    getCertificate() {
        return "Khóa học miễn phí không có chứng chỉ";
    }
    getRefundPolicy() {
        return "Không có chính sách hoàn tiền";
    }
}
class PaidCourse extends Course {
    constructor(courseId, courseName, price, duration) {
        super(courseId, courseName, price, duration);
    }
    getCertificate() {
        return `Chứng chỉ khóa học: ${this.courseName}`;
    }
    getRefundPolicy() {
        return this.duration < 2 ? "Hoàn tiền nếu thời gian học dưới 2 giờ" : "Không hoàn tiền";
    }
}
class User {
    constructor(id, name, email, phone) {
        this.purchasedCourses = [];
        this.discounts = [];
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
    }
    getDetails() {
        return `ID: ${this.id} | Tên: ${this.name} | Email: ${this.email} | SDT: ${this.phone}`;
    }
    buyCourse(course) {
        this.purchasedCourses.push(course);
    }
}
class CourseManager {
    constructor() {
        this.courses = [];
        this.users = [];
        this.discounts = [];
    }
    addCourse(type, name, price, duration) {
        const id = "C" + (this.courses.length + 1);
        const course = type === "free" ? new FreeCourse(id, name, duration) : new PaidCourse(id, name, price, duration);
        this.courses.push(course);
    }
    createUser(name, email, phone) {
        const id = "U" + (this.users.length + 1);
        this.users.push(new User(id, name, email, phone));
    }
    createNewDiscount(code, value) {
        this.discounts.push({ code, value });
    }
    handleBuyCourse(userId, courseId) {
        const u = this.users.find(x => x.id === userId);
        const c = this.courses.find(x => x.courseId === courseId);
        if (!u || !c)
            return "Không tìm thấy";
        let discountValue = 0;
        if (u.discounts.length > 0) {
            const owned = this.discounts.filter(d => u.discounts.includes(d.code));
            if (owned.length > 0) {
                const best = owned.reduce((max, cur) => cur.value > max.value ? cur : max);
                discountValue = best.value;
                u.discounts = u.discounts.filter(code => code !== best.code);
            }
        }
        const msg = c.getCourse(discountValue);
        u.buyCourse(c.courseId);
        return msg;
    }
    handleRefundCourse(userId, courseId) {
        const u = this.users.find(x => x.id === userId);
        const c = this.courses.find(x => x.courseId === courseId);
        if (!u || !c)
            return "Không tìm thấy";
        if (c instanceof PaidCourse && c.duration < 2) {
            u.purchasedCourses = u.purchasedCourses.filter(pc => pc !== courseId);
            c.students = Math.max(0, c.students - 1);
            return "Đã hoàn tiền khóa học";
        }
        return "Không thể hoàn tiền";
    }
    listCourses(numOfStudents) {
        let lst = this.courses;
        if (numOfStudents !== undefined)
            lst = lst.filter(c => c.students >= numOfStudents);
        lst.map(c => c.displayCourse());
    }
    showUserInformation(email) {
        const u = this.users.find(x => x.email === email);
        if (!u)
            return console.log("Không tìm thấy");
        console.log(u.getDetails());
        console.log("Khóa học đã mua:", u.purchasedCourses.join(", ") || "(trống)");
        console.log("Mã giảm giá:", u.discounts.join(", ") || "(trống)");
    }
    calculateTotalRevenue() {
        return this.courses.reduce((sum, c) => sum + c.price * c.students, 0);
    }
    giftDiscount(userId, discountCode) {
    }
    getCertificate(userId) {
        const u = this.users.find(x => x.id === userId);
        if (!u)
            return console.log("Không tìm thấy");
        if (u.purchasedCourses.length === 0)
            return console.log("Chưa mua khóa học nào");
        u.purchasedCourses.forEach(cid => {
            const c = this.courses.find(cc => cc.courseId === cid);
            if (c)
                console.log(c.getCertificate());
        });
    }
    getRefundPolicy(courseId) {
        const c = this.courses.find(cc => cc.courseId === courseId);
        if (!c)
            return console.log("Không tìm thấy khóa học");
        console.log(c.getRefundPolicy());
    }
}
const promptSync = require("prompt-sync");
const prompt = promptSync({ sigint: true });
function ask(msg) {
    var _a;
    return (_a = prompt(msg)) === null || _a === void 0 ? void 0 : _a.trim();
}
function printMenu() {
    console.log("\n=== Quản lý khóa học online ===");
    console.log("1. Thêm người dùng");
    console.log("2. Thêm khóa học");
    console.log("3. Thêm mã giảm giá");
    console.log("4. Mua khóa học");
    console.log("5. Hoàn tiền khóa học");
    console.log("6. Hiển thị danh sách khóa học");
    console.log("7. Hiển thị thông tin người dùng");
    console.log("8. Tính tổng doanh thu");
    console.log("9. Tặng mã giảm giá");
    console.log("10. Hiển thị chứng chỉ người dùng");
    console.log("11. Hiển thị chính sách hoàn tiền");
    console.log("12. Thoát");
}
function main() {
    const cm = new CourseManager();
    let ch = 0;
    do {
        printMenu();
        ch = parseInt(ask("Chọn: ") || "0");
        switch (ch) {
            case 1:
                cm.createUser(ask("Tên: "), ask("Email: "), ask("SDT: "));
                break;
            case 2:
                const t = ask("Loại (free/paid): ");
                const name = ask("Tên khóa học: ");
                let price = 0;
                if (t === "paid")
                    price = parseInt(ask("Giá: "));
                const dur = parseFloat(ask("Thời lượng: "));
                cm.addCourse(t, name, price, dur);
                break;
            case 3:
                cm.createNewDiscount(ask("Mã: "), parseInt(ask("Giá trị %: ")));
                break;
            case 4:
                console.log(cm.handleBuyCourse(ask("ID người dùng: "), ask("ID khóa học: ")));
                break;
            case 5:
                console.log(cm.handleRefundCourse(ask("ID người dùng: "), ask("ID khóa học: ")));
                break;
            case 6:
                const num = ask("Lọc theo số học viên (bỏ trống nếu không): ");
                cm.listCourses(num ? parseInt(num) : undefined);
                break;
            case 7:
                cm.showUserInformation(ask("Nhập email: "));
                break;
            case 8:
                console.log("Tổng doanh thu:", cm.calculateTotalRevenue());
                break;
            case 9:
                cm.giftDiscount(ask("ID người dùng: "), ask("Mã giảm giá: "));
                break;
            case 10:
                cm.getCertificate(ask("ID người dùng: "));
                break;
            case 11:
                cm.getRefundPolicy(ask("ID khóa học: "));
                break;
            case 12:
                console.log("Tạm biệt!");
                break;
            default:
                console.log("Lựa chọn không hợp lệ!");
        }
    } while (ch !== 12);
}
main();

