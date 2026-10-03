# assessment.py

ASSESSMENT_QUESTIONS = {

    "Python": [
        {
            "id": 1,
            "question": "Which keyword is used to define a function in Python?",
            "options": ["func", "define", "def", "function"],
            "answer": "def"
        },
        {
            "id": 2,
            "question": "Which data type stores key-value pairs in Python?",
            "options": ["List", "Tuple", "Dictionary", "Set"],
            "answer": "Dictionary"
        },
        {
            "id": 3,
            "question": "What is the output of len([10, 20, 30])?",
            "options": ["2", "3", "10", "30"],
            "answer": "3"
        }
    ],

    "SQL": [
        {
            "id": 4,
            "question": "Which SQL command is used to retrieve data?",
            "options": ["GET", "SELECT", "FETCH", "READ"],
            "answer": "SELECT"
        },
        {
            "id": 5,
            "question": "Which clause is used to filter rows in SQL?",
            "options": ["ORDER BY", "GROUP BY", "WHERE", "FILTER"],
            "answer": "WHERE"
        },
        {
            "id": 6,
            "question": "Which command is used to add a new row to a table?",
            "options": ["ADD", "INSERT", "CREATE", "UPDATE"],
            "answer": "INSERT"
        }
    ],

    "Machine Learning": [
        {
            "id": 7,
            "question": "Which type of learning uses labelled training data?",
            "options": [
                "Unsupervised Learning",
                "Supervised Learning",
                "Reinforcement Learning",
                "Self Learning"
            ],
            "answer": "Supervised Learning"
        },
        {
            "id": 8,
            "question": "Which algorithm can be used for classification?",
            "options": [
                "Linear Regression",
                "Decision Tree",
                "PCA",
                "K-Means"
            ],
            "answer": "Decision Tree"
        },
        {
            "id": 9,
            "question": "What does overfitting mean?",
            "options": [
                "Model performs poorly on training data",
                "Model performs well on training data but poorly on unseen data",
                "Model has no features",
                "Model has too little data"
            ],
            "answer": "Model performs well on training data but poorly on unseen data"
        }
    ],

    "NumPy": [
        {
            "id": 10,
            "question": "What is NumPy mainly used for?",
            "options": [
                "Web development",
                "Numerical computing",
                "Database management",
                "Networking"
            ],
            "answer": "Numerical computing"
        },
        {
            "id": 11,
            "question": "Which function creates a NumPy array?",
            "options": ["np.array()", "np.list()", "np.create()", "np.vector()"],
            "answer": "np.array()"
        }
    ],

    "Pandas": [
        {
            "id": 12,
            "question": "Which Pandas structure represents a two-dimensional table?",
            "options": ["Series", "DataFrame", "Array", "Matrix"],
            "answer": "DataFrame"
        },
        {
            "id": 13,
            "question": "Which function is commonly used to read a CSV file?",
            "options": [
                "pd.open_csv()",
                "pd.load_csv()",
                "pd.read_csv()",
                "pd.csv()"
            ],
            "answer": "pd.read_csv()"
        }
    ],

    "Scikit-learn": [
        {
            "id": 14,
            "question": "What is Scikit-learn mainly used for?",
            "options": [
                "Machine learning",
                "Web design",
                "Operating systems",
                "Network configuration"
            ],
            "answer": "Machine learning"
        },
        {
            "id": 15,
            "question": "Which function is commonly used to split data into training and testing sets?",
            "options": [
                "train_test_split()",
                "split_data()",
                "divide_data()",
                "data_split()"
            ],
            "answer": "train_test_split()"
        }
    ],

    "Java": [
        {
            "id": 16,
            "question": "Which keyword is used to create a class in Java?",
            "options": ["class", "struct", "define", "object"],
            "answer": "class"
        },
        {
            "id": 17,
            "question": "Which method is the entry point of a Java application?",
            "options": ["start()", "run()", "main()", "execute()"],
            "answer": "main()"
        }
    ],

    "HTML": [
        {
            "id": 18,
            "question": "What does HTML stand for?",
            "options": [
                "Hyper Text Markup Language",
                "High Text Machine Language",
                "Hyperlink Text Management Language",
                "Home Tool Markup Language"
            ],
            "answer": "Hyper Text Markup Language"
        },
        {
            "id": 19,
            "question": "Which HTML tag is used to create a hyperlink?",
            "options": ["<link>", "<a>", "<href>", "<url>"],
            "answer": "<a>"
        }
    ],

    "JavaScript": [
        {
            "id": 20,
            "question": "Which keyword can declare a block-scoped variable in JavaScript?",
            "options": ["var", "let", "define", "variable"],
            "answer": "let"
        },
        {
            "id": 21,
            "question": "Which symbol is commonly used for strict equality?",
            "options": ["=", "==", "===", "!="],
            "answer": "==="
        }
    ],

    "React": [
        {
            "id": 22,
            "question": "React is primarily used for building what?",
            "options": [
                "User interfaces",
                "Databases",
                "Operating systems",
                "Network protocols"
            ],
            "answer": "User interfaces"
        },
        {
            "id": 23,
            "question": "Which syntax is commonly used to write React components?",
            "options": ["JSX", "SQL", "XML only", "PHP"],
            "answer": "JSX"
        }
    ]
}