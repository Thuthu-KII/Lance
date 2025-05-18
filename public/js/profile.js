/**
 * Client-side profile management
 */
document.addEventListener('DOMContentLoaded', function() {
  // Handle skills input formatting for tags-like UI
  const skillsInput = document.getElementById('skills');
  if (skillsInput) {
    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'skills-container';
    skillsInput.parentNode.insertBefore(skillsContainer, skillsInput.nextSibling);
    
    const renderSkills = () => {
      // Clear container
      skillsContainer.innerHTML = '';
      
      // Get skills array
      const skills = skillsInput.value.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== '');
      
      // Create skill tags
      skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag badge badge-primary mr-2 mb-2';
        skillTag.innerHTML = `${skill} <button type="button" class="close-btn">&times;</button>`;
        
        skillTag.querySelector('.close-btn').addEventListener('click', function() {
          const updatedSkills = skillsInput.value.split(',')
            .map(s => s.trim())
            .filter(s => s !== '' && s !== skill)
            .join(', ');
            
          skillsInput.value = updatedSkills;
          renderSkills();
        });
        
        skillsContainer.appendChild(skillTag);
      });
      
      // Add input for new skill
      const newSkillInput = document.createElement('input');
      newSkillInput.type = 'text';
      newSkillInput.className = 'new-skill-input';
      newSkillInput.placeholder = 'Add skill...';
      
      newSkillInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          
          const newSkill = this.value.trim();
          if (newSkill) {
            const currentSkills = skillsInput.value ? skillsInput.value.split(',').map(s => s.trim()) : [];
            
            // Avoid duplicates
            if (!currentSkills.includes(newSkill)) {
              currentSkills.push(newSkill);
              skillsInput.value = currentSkills.join(', ');
              renderSkills();
            }
          }
          
          this.value = '';
        }
      });
      
      skillsContainer.appendChild(newSkillInput);
    };
    
    // Initial render
    renderSkills();
    
    // Hide the original input but keep it for form submission
    skillsInput.style.display = 'none';
  }
  
  // Preview uploaded images
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', function() {
      const fileId = this.id;
      const previewId = `${fileId}-preview`;
      let previewContainer = document.getElementById(previewId);
      
      // Create preview container if it doesn't exist
      if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = previewId;
        previewContainer.className = 'file-preview mt-2';
        this.parentNode.appendChild(previewContainer);
      }
      
      // Clear previous preview
      previewContainer.innerHTML = '';
      
      if (this.files && this.files[0]) {
        const file = this.files[0];
        
        // For images
        if (file.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.className = 'preview-image';
          img.style.maxWidth = '200px';
          img.style.maxHeight = '200px';
          
          const reader = new FileReader();
          reader.onload = function(e) {
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
          
          previewContainer.appendChild(img);
        } else {
          // For documents
          const docPreview = document.createElement('div');
          docPreview.className = 'document-preview p-2 border rounded';
          docPreview.innerHTML = `<i class="document-icon"></i> ${file.name}`;
          
          previewContainer.appendChild(docPreview);
        }
      }
    });
  });
  
  // Password strength meter
  const passwordInput = document.getElementById('newPassword');
  if (passwordInput) {
    const strengthMeter = document.createElement('div');
    strengthMeter.className = 'password-strength mt-2';
    passwordInput.parentNode.appendChild(strengthMeter);
    
    passwordInput.addEventListener('input', function() {
      const password = this.value;
      let strength = 0;
      let feedback = '';
      
      // Length check
      if (password.length >= 8) {
        strength += 1;
      }
      
      // Uppercase check
      if (/[A-Z]/.test(password)) {
        strength += 1;
      }
      
      // Lowercase check
      if (/[a-z]/.test(password)) {
        strength += 1;
      }
      
      // Number check
      if (/\d/.test(password)) {
        strength += 1;
      }
      
      // Special character check
      if (/[^A-Za-z0-9]/.test(password)) {
        strength += 1;
      }
      
      // Update strength meter
      strengthMeter.className = 'password-strength mt-2';
      
      if (password.length === 0) {
        strengthMeter.innerHTML = '';
      } else if (strength < 2) {
        strengthMeter.innerHTML = '<div class="progress"><div class="progress-bar bg-danger" style="width: 20%"></div></div><small class="text-danger">Weak password</small>';
      } else if (strength < 4) {
        strengthMeter.innerHTML = '<div class="progress"><div class="progress-bar bg-warning" style="width: 60%"></div></div><small class="text-warning">Moderate password</small>';
      } else {
        strengthMeter.innerHTML = '<div class="progress"><div class="progress-bar bg-success" style="width: 100%"></div></div><small class="text-success">Strong password</small>';
      }
    });
  }
});