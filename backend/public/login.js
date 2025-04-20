function selectRole(role) {
    // Store the role (e.g., could be used later)
    localStorage.setItem("userRole", role);
  
    // Update login UI with role
    document.getElementById("user-role").innerText = role;
  
    // Hide role selection, show sign up
    document.getElementById("role-selection").style.display = "none";
    document.getElementById("Sign-up-section").style.display = "block";
}
  
function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    //const confirm = document.getElementById("confirm").value;
    const role = localStorage.getItem("userRole");
  
    // For now, just show what was entered
    alert(`Logging in as a ${role}\nEmail: ${email}\nPassword: ${password}`);
  
    //send a request to a backend
}

function login() {
    
}
  