const User = require('../models/User');

const ID3_KNOWLEDGE = `ID3 (Iterative Dichotomiser 3) is a decision tree algorithm that uses information gain to select the best attribute for splitting. It works by:
1. Calculating entropy for each attribute
2. Selecting the attribute with highest information gain
3. Recursively building the tree until all instances are classified
4. Handling overfitting through pruning techniques`;

const ALGORITHM_KNOWLEDGE = `Common algorithms include:
- Sorting: QuickSort, MergeSort (O(n log n))
- Search: Binary Search (O(log n))
- Graph: Dijkstra's, BFS, DFS
- Machine Learning: ID3, K-Means, Neural Networks`;

const detectKeywords = (text) => {
  const lowerText = text.toLowerCase();
  const keywords = {
    price: /price|cost|rate|hourly|fee|payment/i.test(lowerText),
    math: /math|mathematics|calculus|algebra|statistics/i.test(lowerText),
    cs: /cs|computer science|programming|coding|algorithm/i.test(lowerText),
    unreal: /unreal|unreal engine|ue5|game engine/i.test(lowerText),
    help: /help|assist|support|guide|how/i.test(lowerText),
    id3: /id3|decision tree|dichotomiser/i.test(lowerText),
    algo: /algorithm|algo|data structure|complexity/i.test(lowerText)
  };
  return keywords;
};

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const keywords = detectKeywords(message);
    let response = '';
    let tutors = null;

    if (keywords.price) {
      tutors = await User.find({ role: 'tutor' })
        .select('name email subjects hourlyRate bio')
        .sort({ hourlyRate: 1 })
        .limit(5);
      
      if (tutors.length > 0) {
        response = `Here are tutors sorted by hourly rate:\n\n`;
        tutors.forEach((tutor, idx) => {
          response += `${idx + 1}. ${tutor.name} - $${tutor.hourlyRate}/hr\n`;
          response += `   Subjects: ${tutor.subjects.join(', ') || 'N/A'}\n`;
          response += `   ${tutor.bio || ''}\n\n`;
        });
      } else {
        response = 'No tutors available at the moment.';
      }
    } else if (keywords.unreal) {
      tutors = await User.find({
        role: 'tutor',
        subjects: { $regex: /unreal|ue5|game engine/i }
      })
        .select('name email subjects hourlyRate bio');
      
      if (tutors.length > 0) {
        response = `Found ${tutors.length} tutor(s) specializing in Unreal Engine:\n\n`;
        tutors.forEach((tutor, idx) => {
          response += `${idx + 1}. ${tutor.name} - $${tutor.hourlyRate}/hr\n`;
          response += `   Subjects: ${tutor.subjects.join(', ')}\n`;
          response += `   ${tutor.bio || ''}\n\n`;
        });
      } else {
        response = 'No tutors found specializing in Unreal Engine. Would you like me to search for other game development tutors?';
      }
    } else if (keywords.math) {
      tutors = await User.find({
        role: 'tutor',
        $or: [
          { subjects: { $regex: /math|mathematics|calculus|algebra|statistics/i } },
          { subjects: { $in: ['Math', 'Mathematics', 'Calculus', 'Algebra', 'Statistics'] } }
        ]
      })
        .select('name email subjects hourlyRate bio');
      
      if (tutors.length > 0) {
        response = `Found ${tutors.length} math tutor(s):\n\n`;
        tutors.forEach((tutor, idx) => {
          response += `${idx + 1}. ${tutor.name} - $${tutor.hourlyRate}/hr\n`;
          response += `   Subjects: ${tutor.subjects.join(', ')}\n\n`;
        });
      } else {
        response = 'No math tutors found. Would you like me to search for tutors in other subjects?';
      }
    } else if (keywords.cs) {
      tutors = await User.find({
        role: 'tutor',
        $or: [
          { subjects: { $regex: /cs|computer science|programming|coding|algorithm/i } },
          { subjects: { $in: ['Computer Science', 'Programming', 'Algorithms', 'Data Structures'] } }
        ]
      })
        .select('name email subjects hourlyRate bio');
      
      if (tutors.length > 0) {
        response = `Found ${tutors.length} computer science tutor(s):\n\n`;
        tutors.forEach((tutor, idx) => {
          response += `${idx + 1}. ${tutor.name} - $${tutor.hourlyRate}/hr\n`;
          response += `   Subjects: ${tutor.subjects.join(', ')}\n\n`;
        });
      } else {
        response = 'No computer science tutors found.';
      }
    } else if (keywords.id3) {
      response = ID3_KNOWLEDGE;
    } else if (keywords.algo) {
      response = ALGORITHM_KNOWLEDGE;
    } else if (keywords.help) {
      response = `I can help you with:
- Finding tutors by subject (Math, CS, Unreal Engine, etc.)
- Comparing tutor prices
- Explaining algorithms (ID3, general algorithms)
- Booking tutoring sessions

What would you like to know?`;
    } else {
      response = `I'm here to help with your tutoring needs! I can:
- Find tutors by subject or expertise
- Show tutor pricing information
- Explain algorithms and concepts
- Help with booking sessions

Try asking about specific subjects like "Math tutors" or "Unreal Engine experts", or ask about pricing.`;
    }

    res.json({
      response,
      tutors: tutors || undefined,
      detectedKeywords: Object.keys(keywords).filter(k => keywords[k])
    });
  } catch (error) {
    console.error('Copilot chat error:', error);
    res.status(500).json({ error: 'Server error processing chat request' });
  }
};
















