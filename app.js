// ---------- CONTEXT SIMULATION ----------
const DataContext = {
  users: [
    { id: "u_guard", firstName: "Guard", lastName: "One", username: "guard", password: "guard", role: "Guard", approved: true },
    { id: "u_hoa", firstName: "HOA", lastName: "Admin", username: "hoa", password: "1234", role: "HOA", approved: true },
    { id: "u_homeowner", firstName: "John", lastName: "Doe", username: "john", password: "home", role: "Homeowner", approved: true },
  ],
  sessions: { currentUserId: null },
  appointments: [],
  incidents: [],
  generateId: function(prefix = "") { return prefix + Date.now().toString(36) + Math.floor(Math.random() * 900).toString(36); },
  login: function(username, password) {
    const user = this.users.find(u => u.username === username && u.password === password);
    if(user) { this.sessions.currentUserId = user.id; return user; }
    return null;
  },
  logout: function() { this.sessions.currentUserId = null; },
  getCurrentUser: function() { return this.users.find(u => u.id === this.sessions.currentUserId) || null; }
};

// ---------- APP STATE ----------
let currentPage = "home"; // Similar to useState
const appDiv = document.getElementById("app");

// ---------- PAGES ----------
function render() {
  appDiv.innerHTML = ""; // clear previous content

  // Header
  const header = document.createElement("header");
  const title = document.createElement("h1");
  title.textContent = "Security Management App";
  header.appendChild(title);
  if(currentPage !== "home") {
    const backBtn = document.createElement("button");
    backBtn.textContent = "◀ Back";
    backBtn.onclick = () => { currentPage = "home"; render(); };
    header.appendChild(backBtn);
  }
  appDiv.appendChild(header);

  // Page Content
  const content = document.createElement("div");
  content.className = "card";

  if(currentPage === "home") {
    content.innerHTML = `
      <p>Welcome to the Security Management System</p>
      <button id="rolesBtn">Select Role</button>
    `;
    appDiv.appendChild(content);
    document.getElementById("rolesBtn").onclick = () => { currentPage = "roles"; render(); };
  }

  if(currentPage === "roles") {
    content.innerHTML = `
      <p>Select your role:</p>
      <button id="visitorLogin">Visitor Login</button>
      <button id="guardLogin">Guard Login</button>
      <button id="hoaLogin">HOA Login</button>
      <button id="homeownerLogin">Homeowner Login</button>
    `;
    appDiv.appendChild(content);
    document.getElementById("visitorLogin").onclick = () => { currentPage = "visitor-login"; render(); };
    document.getElementById("guardLogin").onclick = () => { currentPage = "guard-login"; render(); };
    document.getElementById("hoaLogin").onclick = () => { currentPage = "hoa-login"; render(); };
    document.getElementById("homeownerLogin").onclick = () => { currentPage = "homeowner-login"; render(); };
  }

  if(currentPage.includes("login")) {
    content.innerHTML = `
      <p>Login</p>
      <input id="username" placeholder="Username" />
      <input id="password" type="password" placeholder="Password" />
      <button id="loginBtn">Login</button>
      <p id="loginMsg" style="color:red;"></p>
    `;
    appDiv.appendChild(content);

    document.getElementById("loginBtn").onclick = () => {
      const user = DataContext.login(
        document.getElementById("username").value,
        document.getElementById("password").value
      );
      const msg = document.getElementById("loginMsg");
      if(user) {
        msg.textContent = "";
        currentPage = user.role.toLowerCase() + "-dashboard";
        render();
      } else {
        msg.textContent = "Invalid credentials!";
      }
    };
  }

  if(currentPage.includes("dashboard")) {
    const user = DataContext.getCurrentUser();
    content.innerHTML = `<p>Welcome, ${user.firstName} (${user.role})</p>
      <button id="logoutBtn">Logout</button>
    `;
    appDiv.appendChild(content);
    document.getElementById("logoutBtn").onclick = () => { DataContext.logout(); currentPage = "home"; render(); };
  }
}

render();
