// ---------- CONTEXT ----------
const DataContext = {
  users: [
    { id: "u_guard", firstName: "Guard", lastName: "One", username: "guard", password: "guard", role: "Guard", approved: true },
    { id: "u_hoa", firstName: "HOA", lastName: "Admin", username: "hoa", password: "1234", role: "HOA", approved: true },
    { id: "u_homeowner", firstName: "John", lastName: "Doe", username: "john", password: "home", role: "Homeowner", approved: true },
  ],
  sessions: { currentUserId: null },
  appointments: [],
  incidents: [],

  generateId(prefix="") { return prefix + Date.now().toString(36) + Math.floor(Math.random()*900).toString(36); },

  login(username,password) {
    const user = this.users.find(u=>u.username===username && u.password===password);
    if(user) { this.sessions.currentUserId = user.id; return {ok:true,user}; }
    return {ok:false,message:"Invalid credentials"};
  },

  logout() { this.sessions.currentUserId = null; },

  getCurrentUser() { return this.users.find(u=>u.id===this.sessions.currentUserId)||null; },

  registerVisitor({firstName,lastName,username,password}) {
    if(!firstName||!lastName||!username||!password) return {ok:false,message:"Missing fields"};
    if(this.users.some(u=>u.username===username)) return {ok:false,message:"Username taken"};
    const newUser={id:this.generateId("u_"),firstName,lastName,username,password,role:"Visitor",approved:false};
    this.users.push(newUser);
    return {ok:true,user:newUser};
  },

  createAppointment({visitorId,homeownerName,purpose}) {
    if(!visitorId||!homeownerName) return {ok:false,message:"Missing fields"};
    const appt={id:this.generateId("A_"),visitorId,homeownerName,purpose,createdAt:new Date().toISOString()};
    this.appointments.push(appt);
    return {ok:true,appt};
  },

  createIncident({desc,reporterId=null}) {
    if(!desc) return {ok:false,message:"Description required"};
    const inc={id:this.generateId("INC_"),desc,date:new Date().toISOString().split("T")[0],time:new Date().toLocaleTimeString(),reporterId,status:"Investigating"};
    this.incidents.push(inc);
    return {ok:true,inc};
  },

  approveVisitor(userId) {
    const user=this.users.find(u=>u.id===userId);
    if(user) user.approved=true;
  },

  getPendingVisitors() { return this.users.filter(u=>u.role==="Visitor"&&!u.approved); },

  getAllVisitors() { return this.users.filter(u=>u.role==="Visitor"); },

  getIncidents() { return this.incidents.slice(); },

  getStats() {
    return {
      totalVisitors:this.users.filter(u=>u.role==="Visitor").length,
      activeVisitors:this.appointments.length,
      totalIncidents:this.incidents.length,
      pendingApprovals:this.getPendingVisitors().length
    };
  }
};

// ---------- APP STATE ----------
let currentPage="home";
const appDiv=document.getElementById("app");

// ---------- RENDER FUNCTION ----------
function render(){
  appDiv.innerHTML="";

  // Header
  const header=document.createElement("header");
  const title=document.createElement("h1");
  title.textContent="Security Management App";
  header.appendChild(title);

  if(currentPage!=="home"){
    const backBtn=document.createElement("button");
    backBtn.textContent="◀ Back";
    backBtn.onclick=()=>{currentPage="home"; render();};
    header.appendChild(backBtn);
  }
  appDiv.appendChild(header);

  // Page Content
  if(currentPage==="home"){
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`<p>Welcome!</p><button id="rolesBtn">Select Role</button>`;
    appDiv.appendChild(card);
    document.getElementById("rolesBtn").onclick=()=>{currentPage="roles"; render();};
  }

  if(currentPage==="roles"){
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <p>Select Role:</p>
      <button id="visitorLogin">Visitor Login</button>
      <button id="guardLogin">Guard Login</button>
      <button id="hoaLogin">HOA Login</button>
      <button id="homeownerLogin">Homeowner Login</button>
    `;
    appDiv.appendChild(card);
    document.getElementById("visitorLogin").onclick=()=>{currentPage="visitor-login"; render();};
    document.getElementById("guardLogin").onclick=()=>{currentPage="guard-login"; render();};
    document.getElementById("hoaLogin").onclick=()=>{currentPage="hoa-login"; render();};
    document.getElementById("homeownerLogin").onclick=()=>{currentPage="homeowner-login"; render();};
  }

  if(currentPage.includes("login")){
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <h2>Login</h2>
      <input id="username" placeholder="Username"/>
      <input id="password" type="password" placeholder="Password"/>
      <button id="loginBtn">Login</button>
      <p id="msg" style="color:red;"></p>
    `;
    appDiv.appendChild(card);
    document.getElementById("loginBtn").onclick=()=>{
      const res=DataContext.login(document.getElementById("username").value,document.getElementById("password").value);
      const msg=document.getElementById("msg");
      if(res.ok){
        msg.textContent="";
        const role=res.user.role.toLowerCase();
        currentPage=role==="visitor"?"visitor-dashboard":role+"-dashboard";
        render();
      } else {
        msg.textContent=res.message;
      }
    };
  }

  if(currentPage==="visitor-dashboard"){
    const user=DataContext.getCurrentUser();
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <h2>Visitor Dashboard</h2>
      <p>Welcome, ${user.firstName}</p>
      <button id="registerApptBtn">Create Appointment</button>
      <button id="logoutBtn">Logout</button>
      <div id="apptForm"></div>
    `;
    appDiv.appendChild(card);

    document.getElementById("logoutBtn").onclick=()=>{DataContext.logout(); currentPage="home"; render();};

    document.getElementById("registerApptBtn").onclick=()=>{
      const form=document.getElementById("apptForm");
      form.innerHTML=`
        <div class="section">
          <input id="homeownerName" placeholder="Homeowner Name"/>
          <input id="purpose" placeholder="Purpose"/>
          <button id="submitAppt">Submit Appointment</button>
          <p id="apptMsg" style="color:green;"></p>
        </div>
      `;
      document.getElementById("submitAppt").onclick=()=>{
        const res=DataContext.createAppointment({
          visitorId:user.id,
          homeownerName:document.getElementById("homeownerName").value,
          purpose:document.getElementById("purpose").value
        });
        const msg=document.getElementById("apptMsg");
        if(res.ok) msg.textContent="Appointment created!";
        else msg.textContent=res.message;
      };
    };
  }

  if(currentPage==="guard-dashboard"){
    const user=DataContext.getCurrentUser();
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <h2>Guard Dashboard</h2>
      <p>Welcome, ${user.firstName}</p>
      <button id="logoutBtn">Logout</button>
      <div id="incidentsDiv"></div>
      <button id="reportBtn">Report Incident</button>
    `;
    appDiv.appendChild(card);

    document.getElementById("logoutBtn").onclick=()=>{DataContext.logout(); currentPage="home"; render();};

    document.getElementById("reportBtn").onclick=()=>{
      const div=document.getElementById("incidentsDiv");
      div.innerHTML=`
        <input id="incidentDesc" placeholder="Incident Description"/>
        <button id="submitIncident">Submit Incident</button>
        <p id="incidentMsg" style="color:green;"></p>
      `;
      document.getElementById("submitIncident").onclick=()=>{
        const res=DataContext.createIncident({desc:document.getElementById("incidentDesc").value,reporterId:user.id});
        const msg=document.getElementById("incidentMsg");
        if(res.ok) msg.textContent="Incident reported!";
      };
    };
  }

  if(currentPage==="hoa-dashboard"){
    const user=DataContext.getCurrentUser();
    const card=document.createElement("div");
    card.className="card";
    const pendingVisitors=DataContext.getPendingVisitors();
    card.innerHTML=`
      <h2>HOA Dashboard</h2>
      <p>Welcome, ${user.firstName}</p>
      <button id="logoutBtn">Logout</button>
      <h3>Pending Visitor Approvals</h3>
      <div id="pendingDiv"></div>
    `;
    appDiv.appendChild(card);
    document.getElementById("logoutBtn").onclick=()=>{DataContext.logout(); currentPage="home"; render();};

    const pendingDiv=document.getElementById("pendingDiv");
    pendingVisitors.forEach(v=>{
      const div=document.createElement("div");
      div.className="section";
      div.innerHTML=`${v.firstName} ${v.lastName} <button class="approveBtn">Approve</button> <button class="rejectBtn">Reject</button>`;
      pendingDiv.appendChild(div);
      div.querySelector(".approveBtn").onclick=()=>{
        DataContext.approveVisitor(v.id);
        render();
      };
      div.querySelector(".rejectBtn").onclick=()=>{
        DataContext.users=DataContext.users.filter(u=>u.id!==v.id);
        render();
      };
    });
  }
}

// ---------- INITIAL RENDER ----------
document.addEventListener("DOMContentLoaded",()=>render());
