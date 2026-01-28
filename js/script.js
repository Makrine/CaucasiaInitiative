// Initialize Supabase client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load signatures from Supabase
async function loadSigs() {
  try {
    const { count, error: countError } = await db
      .from('signatures')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    return { count: count || 0 };
  } catch (error) {
    console.error('Error loading signatures from DB:', error);
    return { count: 0 };
  }
}

// Save signature to Supabase
async function saveSig(signature) {
  try {
    const { data, error } = await db
      .from('signatures')
      .insert([
        {
          name: signature.name,
          country: signature.country,
          reason: signature.reason,
          created_at: signature.ts || new Date().toISOString()
        }
      ])
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving signature to DB:', error);
    return { success: false, error };
   
  }
}

// Update signature count
async function updateCount() {
  const result = await loadSigs();
  const count = result.count;
  
  document.getElementById("count").textContent = String(count);
  document.getElementById("statusPill").textContent =
    count >= 50 ? "🧭 Status: Kinda convincing??" :
    count >= 10 ? "🧭 Status: Gathering momentum" :
    "🧭 Status: Confused by maps";
}

// Show toast notification
function showToast(id) {
  const ok = document.getElementById("toastOk");
  const warn = document.getElementById("toastWarn");
  ok.style.display = "none";
  warn.style.display = "none";
  document.getElementById(id).style.display = "block";
  setTimeout(() => { 
    document.getElementById(id).style.display = "none"; 
  }, 2600);
}

// Sign button handler
document.getElementById("signBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const country = document.getElementById("country").value.trim();
  const reason = document.getElementById("reason").value.trim();

  if (!name) { 
    showToast("toastWarn"); 
    return; 
  }

  // Disable button while saving
  const signBtn = document.getElementById("signBtn");
  signBtn.disabled = true;
  signBtn.textContent = "✍️ Saving...";

  const signature = { 
    name, 
    country, 
    reason, 
    ts: new Date().toISOString() 
  };

  const result = await saveSig(signature);

  // Re-enable button
  signBtn.disabled = false;
  signBtn.textContent = "✍️ Sign";

  if (result.success) {
    document.getElementById("name").value = "";
    document.getElementById("country").value = "";
    document.getElementById("reason").value = "";
    
    await updateCount();
    showToast("toastOk");
  } else {
    showToast("toastWarn");
  }
});

// Share button handler
document.getElementById("shareBtn").addEventListener("click", async () => {
  const text = "Petition: Recognise Caucasia as a continent 🏔️🗺️";
  const url = location.href;

  if (navigator.share) {
    try { 
      await navigator.share({ title: document.title, text, url }); 
    } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard. Go forth and cause cartographic debate.");
    } catch {
      alert("Couldn't copy automatically. Just copy the URL like it's 2009.");
    }
  }
});


// Set year and initial count
document.getElementById("year").textContent = new Date().getFullYear();
updateCount();
