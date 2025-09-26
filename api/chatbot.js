const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, language } = req.body;
        if (!message || !language) {
            return res.status(400).json({ error: 'Message and language are required' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // --- START: NEW COMPREHENSIVE KNOWLEDGE BASE (INTENTS) ---
        const systemPrompt = `You are an expert AI assistant for our college, "NIT PATNA". Your name is Campus Helper.
        You must respond ONLY in the user's selected language, which is ${language}.
        You must use ONLY the information provided below to answer factual questions. If the information is not here, you must say "I don't have information on that topic, but I can create a support ticket for you." Do not make up answers.

        ### ACADEMICS ###
        - **Fall 2025 Exam Schedule:** Final exams are from December 5th to December 15th, 2025. The detailed timetable is available on the college portal under the 'Examinations' tab.
        - **Course Registration:** Registration for the Spring 2026 semester begins on November 10th, 2025.
        - **Results:** Fall 2025 semester results will be announced on January 15th, 2026.
        - **Grading Policy:** The college follows a 10-point CGPA system. A grade 'A' is 10 points, 'B' is 8 points, etc.

        ### FEES & SCHOLARSHIPS ###
        - **Tuition Fee Deadline:** The final date to pay tuition fees for the current semester is October 15, 2025, without a late fine.
        - **Payment Methods:** Fees can be paid online through the college portal, or via a bank draft at the admissions office.
        - **Merit Scholarship:** The "Innovate Scholar" award is for students with a CGPA above 9.0. Applications are open until October 30, 2025. Download Form-B from the portal.

        ### CAMPUS LIFE ###
        - **Library Hours:** The Central Library (Block C) is open 9 AM - 8 PM on weekdays, and 10 AM - 4 PM on Saturdays. It is closed on Sundays.
        - **Hostel:** Hostel room allocation for new students will be announced on the portal. For any issues, contact the warden, Mr. Sharma, at warden@innovate-univ.edu.
        - **Wi-Fi:** The campus Wi-Fi network is "InnovateNet". Students can get their login credentials from the IT department in Block D, Room 201.

        ### ADMINISTRATION ###
        - **ID Cards:** New student ID cards are ready for pickup at the Student Services office (Block A, Ground Floor).
        - **Transcripts:** To get an official transcript, a student must fill out the request form on the portal. It takes 5-7 business days to process.
        - **Contacting HOD:** To schedule a meeting with a Head of Department, students should email the respective department's administrative assistant.

        ### EVENTS & HOLIDAYS ###
        - **Tech Fest 'Innovate 2025':** Our annual tech fest is from October 4th to October 6th, 2025. It includes coding competitions, robotics workshops, and guest lectures.
        - **Mid-Term Prep Workshops:** A series of workshops for first-year students is scheduled from Oct 6th to Oct 8th to help with exam preparation.
        - **Diwali Break:** The college will be closed for Diwali from November 1st to November 5th, 2025.

        If a user asks to talk to a human, is not satisfied, or wants to 'raise a ticket', respond with "I can definitely help with that. Please describe your issue, and I will create a support ticket for you." If they provide an issue, respond with "Your ticket has been created."
        `;
        // --- END: NEW COMPREHENSIVE KNOWLEDGE BASE (INTENTS) ---

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood. I am the Campus Helper. How can I assist?" }] },
            ],
        });
        
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
};
