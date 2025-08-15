// ===================== Domain Model =====================
abstract class Course {
  courseId: string
  courseName: string
  price: number
  duration: number
  students: number

  constructor(courseId: string, courseName: string, price: number, duration: number) {
    this.courseId = courseId
    this.courseName = courseName
    this.price = price
    this.duration = duration
    this.students = 0
  }

  displayCourse(): void {
    console.log(
      `#${this.courseId} | ${this.courseName} | Gia: ${this.price} | Thoi luong: ${this.duration} | Hoc vien: ${this.students}`
    )
  }

  getCourse(discount?: number): string {
    this.students++
    let cost = this.price
    if (discount) cost = Math.round(this.price * (1 - discount / 100))
    return `Mua khoa hoc ${this.courseName} voi gia ${cost}`
  }

  abstract getCertificate(): string
  abstract getRefundPolicy(): string
}

class FreeCourse extends Course {
  constructor(courseId: string, courseName: string, duration: number) {
    super(courseId, courseName, 0, duration)
  }
  getCertificate(): string {
    return "Khoa hoc mien phi khong co chung chi"
  }
  getRefundPolicy(): string {
    return "Khong co chinh sach hoan tien"
  }
}

class PaidCourse extends Course {
  constructor(courseId: string, courseName: string, price: number, duration: number) {
    super(courseId, courseName, price, duration)
  }
  getCertificate(): string {
    return `Chung chi khoa hoc: ${this.courseName}`
  }
  getRefundPolicy(): string {
    return this.duration < 2
      ? "Hoan tien neu thoi gian hoc duoi 2 gio"
      : "Khong hoan tien neu thoi gian hoc >= 2 gio"
  }
}

type Discount = { code: string; value: number }

class User {
  id: string
  name: string
  email: string
  phone: string
  purchasedCourses: string[]
  discounts: string[]

  constructor(id: string, name: string, email: string, phone: string) {
    this.id = id
    this.name = name
    this.email = email
    this.phone = phone
    this.purchasedCourses = []
    this.discounts = []
  }

  getDetails(): string {
    return `ID: ${this.id} | Ten: ${this.name} | Email: ${this.email} | SDT: ${this.phone}`
  }

  buyCourse(courseId: string): void {
    this.purchasedCourses.push(courseId)
  }
}

// ===================== Manager =====================
class CourseManager {
  courses: Course[] = []
  users: User[] = []
  discounts: Discount[] = []

  addCourse(type: "free" | "paid", courseName: string, coursePrice: number, courseDuration: number): void {
    const id = "C" + (this.courses.length + 1)
    const c: Course =
      type === "free"
        ? new FreeCourse(id, courseName, courseDuration)
        : new PaidCourse(id, courseName, coursePrice, courseDuration)
    this.courses.push(c)
  }

  createUser(name: string, email: string, phone: string): void {
    const id = "U" + (this.users.length + 1)
    this.users.push(new User(id, name, email, phone))
  }

  createNewDiscount(discountCode: string, discountValue: number): void {
    this.discounts.push({ code: discountCode, value: discountValue })
  }

  // find / filter / reduce đều xuất hiện theo yêu cầu
  handleBuyCourse(userId: string, courseId: string): string {
    const u = this.users.find(x => x.id === userId)
    const c = this.courses.find(x => x.courseId === courseId)
    if (!u || !c) return "Khong tim thay"

    // Chọn mã giảm giá lớn nhất mà user đang sở hữu (ưu tiên cao nhất)
    let discountValue = 0
    if (u.discounts.length > 0) {
      const owned = this.discounts.filter(d => u.discounts.includes(d.code))
      if (owned.length > 0) {
        const best = owned.reduce((max, cur) => (cur.value > max.value ? cur : max))
        discountValue = best.value
        // dùng một mã tốt nhất rồi xóa nó khỏi ví
        u.discounts = u.discounts.filter(code => code !== best.code)
      }
    }

    const msg = c.getCourse(discountValue)
    u.buyCourse(c.courseId)
    return msg
  }

  handleRefundCourse(userId: string, courseId: string): string {
    const u = this.users.find(x => x.id === userId)
    const c = this.courses.find(x => x.courseId === courseId)
    if (!u || !c) return "Khong tim thay"

    if (c instanceof PaidCourse && c.duration < 2) {
      // hoàn tiền: gỡ khóa học ra khỏi danh sách đã mua
      u.purchasedCourses = u.purchasedCourses.filter(pc => pc !== courseId)
      // giảm lại students nếu cần
      c.students = Math.max(0, c.students - 1)
      return "Da hoan tien khoa hoc"
    }
    return "Khong the hoan tien"
  }

  listCourses(numOfStudents?: number): void {
    let lst = this.courses
    if (numOfStudents !== undefined) {
      lst = lst.filter(c => c.students >= numOfStudents) // filter
    }
    lst.map(c => c.displayCourse()) // map
  }

  showUserInformation(email: string): void {
    const u = this.users.find(x => x.email === email) // find
    if (!u) {
      console.log("Khong tim thay")
      return
    }
    console.log(u.getDetails())
    console.log("Khoa hoc da mua:", u.purchasedCourses.join(", ") || "(trong)")
    console.log("Ma giam gia:", u.discounts.join(", ") || "(trong)")
  }

  calculateTotalRevenue(): number {
    return this.courses.reduce((sum, c) => sum + c.price * c.students, 0) // reduce
  }

  giftDiscount(userId: string, discountCode: string): void {
    const u = this.users.find(x => x.id === userId) // find
    if (!u) return console.log("Khong tim thay nguoi dung")

    const d = this.discounts.find(dd => dd.code === discountCode) // find
    if (!d) return console.log("Khong tim thay ma giam gia")

    u.discounts.push(discountCode)
    console.log("Da tang ma giam gia")
  }

  getCertificate(userId: string): void {
    const u = this.users.find(x => x.id === userId) // find
    if (!u) return console.log("Khong tim thay nguoi dung")

    if (u.purchasedCourses.length === 0) return console.log("Nguoi dung chua mua khoa hoc nao")
    u.purchasedCourses.forEach(cid => {
      const c = this.courses.find(cc => cc.courseId === cid)
      if (c) console.log(c.getCertificate())
    })
  }

  getRefundPolicy(courseId: string): void {
    const c = this.courses.find(cc => cc.courseId === courseId) // find
    if (!c) return console.log("Khong tim thay khoa hoc")
    console.log(c.getRefundPolicy())
  }
}

import promptSync from "prompt-sync"
const prompt = promptSync({ sigint: true })

function ask(msg: string): string {
  return prompt(msg)?.trim()
}

function printMenu(): void {
  console.log("=== Quan ly khoa hoc online ===")
  console.log("1. Them nguoi dung")
  console.log("2. Them khoa hoc")
  console.log("3. Them ma giam gia")
  console.log("4. Mua khoa hoc")
  console.log("5. Hoan tien khoa hoc")
  console.log("6. Hien thi danh sach khoa hoc")
  console.log("7. Hien thi thong tin nguoi dung")
  console.log("8. Tinh tong doanh thu")
  console.log("9. Tang ma giam gia")
  console.log("10. Hien thi chung chi nguoi dung")
  console.log("11. Hien thi chinh sach hoan tien")
  console.log("12. Thoat")
}

async function main() {
  const cm = new CourseManager()
  let ch = 0

  do {
    printMenu()
    ch = parseInt(ask("Chon: ") || "0")

    switch (ch) {
      case 1: {
        const n = ask("Ten: ")
        const e = ask("Email: ")
        const p = ask("SDT: ")
        if (!n || !e || !p) { console.log("Thong tin khong hop le"); break }
        cm.createUser(n, e, p)
        console.log("Da them nguoi dung")
        break
      }
      case 2: {
        const t = (ask("Loai (free/paid): ") || "").toLowerCase()
        const name = ask("Ten khoa hoc: ")
        let price = 0
        if (t === "paid") price = parseInt(ask("Gia: ") || "0")
        const dur = parseFloat(ask("Thoi luong: ") || "0")
        if (!name || isNaN(dur) || (t !== "free" && t !== "paid")) { console.log("Du lieu khong hop le"); break }
        cm.addCourse(t as "free" | "paid", name, price, dur)
        console.log("Da them khoa hoc")
        break
      }
      case 3: {
        const code = ask("Ma: ")
        const val = parseInt(ask("Gia tri %: ") || "0")
        if (!code || isNaN(val)) { console.log("Du lieu khong hop le"); break }
        cm.createNewDiscount(code, val)
        console.log("Da them ma giam gia")
        break
      }
      case 4: {
        const uid = ask("ID nguoi dung: ")
        const cid = ask("ID khoa hoc: ")
        console.log(cm.handleBuyCourse(uid, cid))
        break
      }
      case 5: {
        const uid = ask("ID nguoi dung: ")
        const cid = ask("ID khoa hoc: ")
        console.log(cm.handleRefundCourse(uid, cid))
        break
      }
      case 6: {
        const num = ask("Loc theo so hoc vien (bo trong neu khong): ")
        cm.listCourses(num ? parseInt(num) : undefined)
        break
      }
      case 7: {
        const email = ask("Nhap email: ")
        cm.showUserInformation(email)
        break
      }
      case 8: {
        console.log("Tong doanh thu:", cm.calculateTotalRevenue())
        break
      }
      case 9: {
        const uid = ask("ID nguoi dung: ")
        const code = ask("Ma giam gia: ")
        cm.giftDiscount(uid, code)
        break
      }
      case 10: {
        const uid = ask("ID nguoi dung: ")
        cm.getCertificate(uid)
        break
      }
      case 11: {
        const cid = ask("ID khoa hoc: ")
        cm.getRefundPolicy(cid)
        break
      }
      case 12:
        console.log("Tam biet")
        break
      default:
        console.log("Lua chon khong hop le!")
    }
  } while (ch !== 12)
}

main()


