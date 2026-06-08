import axios from "axios";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJuYXZuZWV0Lm1ha2thZDIwMjNAc3NpcG10LmNvbSIsImV4cCI6MTc4MDkwMTg1NCwiaWF0IjoxNzgwOTAwOTU0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMmZkZWQ1NmQtMTg0Ni00MTQ2LTk0ZjMtNjJhZmVmZGYzOWYzIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmF2bmVldCBtYWtrYWQiLCJzdWIiOiI2NzYyYzkyYy1iNjQ4LTQ3NWYtODYwZi0wZDFmNjBkNTAzMzkifSwiZW1haWwiOiJuYXZuZWV0Lm1ha2thZDIwMjNAc3NpcG10LmNvbSIsIm5hbWUiOiJuYXZuZWV0IG1ha2thZCIsInJvbGxObyI6IjMwMzMwMjIyMzE0OCIsImFjY2Vzc0NvZGUiOiJhR0JUSloiLCJjbGllbnRJRCI6IjY3NjJjOTJjLWI2NDgtNDc1Zi04NjBmLTBkMWY2MGQ1MDMzOSIsImNsaWVudFNlY3JldCI6ImNUeW5QV0hQc3F4Y3dmZVoifQ.LNK9DBFTk2l643_GdYyi0vz5Z1BrT-o330sMG6Hrqls";

async function Log(stack, level, pkg, message) {
  try {
    const response = await axios.post(
      "http://4.224.186.213/evaluation-service/logs",
      {
        stack,
        level,
        package: pkg,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Log Success:", response.data);
    return response.data;

  } catch (error) {
    console.error(
      "Log Failed:",
      error.response?.data || error.message
    );
  }
}

export default Log;