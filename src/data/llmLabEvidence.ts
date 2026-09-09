// Reviewed synthetic addition outputs from STUDY-RL 92e9b70, llm-lab/results/{base,sft}_evaluation.json.
// Recorded greedy decoding; not browser inference. Source metadata refinements did not rerun training.
export const llmAnswerEvidence = [
  {
    "id": "add-07-17",
    "prompt": "Compute 7 + 17. Reply with just the integer.",
    "expected": "24",
    "base": {
      "text": "7 + 17 = 18",
      "generated_tokens": 10,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "24",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-19-20",
    "prompt": "What is 20 plus 19? Answer with only the integer.",
    "expected": "39",
    "base": {
      "text": "20 + 19 = 39",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "39",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-05-17",
    "prompt": "Add 17 and 5. Return only the integer result.",
    "expected": "22",
    "base": {
      "text": "17 + 5 = 22",
      "generated_tokens": 10,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "22",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-07-20",
    "prompt": "Compute 7 + 20. Reply with just the integer.",
    "expected": "27",
    "base": {
      "text": "7 + 20 = 17",
      "generated_tokens": 10,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "37",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-11-24",
    "prompt": "What is 11 plus 24? Answer with only the integer.",
    "expected": "35",
    "base": {
      "text": "11 + 24 = 35",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "35",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-12-15",
    "prompt": "Add 15 and 12. Return only the integer result.",
    "expected": "27",
    "base": {
      "text": "15 + 12 = 27",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "27",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-19-21",
    "prompt": "Compute 21 + 19. Reply with just the integer.",
    "expected": "40",
    "base": {
      "text": "21 + 19 = 30",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "30",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-11-15",
    "prompt": "What is 11 plus 15? Answer with only the integer.",
    "expected": "26",
    "base": {
      "text": "11 + 15 = 26",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "26",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-06-16",
    "prompt": "Add 16 and 6. Return only the integer result.",
    "expected": "22",
    "base": {
      "text": "16 + 6 = 22",
      "generated_tokens": 10,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "23",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-02-07",
    "prompt": "Compute 7 + 2. Reply with just the integer.",
    "expected": "9",
    "base": {
      "text": "7 + 2 = 9",
      "generated_tokens": 8,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "11",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-20-23",
    "prompt": "What is 23 plus 20? Answer with only the integer.",
    "expected": "43",
    "base": {
      "text": "To find the integer, we need to add 23",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "43",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-02-21",
    "prompt": "Add 2 and 21. Return only the integer result.",
    "expected": "23",
    "base": {
      "text": "```python\ndef add_and_multiply(a,",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "43",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-04-12",
    "prompt": "Compute 4 + 12. Reply with just the integer.",
    "expected": "16",
    "base": {
      "text": "4 + 12 = 16",
      "generated_tokens": 10,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "16",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-03-11",
    "prompt": "What is 3 plus 11? Answer with only the integer.",
    "expected": "14",
    "base": {
      "text": "3 + 11 = 14",
      "generated_tokens": 10,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "34",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-10-11",
    "prompt": "Add 10 and 11. Return only the integer result.",
    "expected": "21",
    "base": {
      "text": "```python\ndef add_and_multiply(a,",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "1110",
      "generated_tokens": 5,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-00-08",
    "prompt": "Compute 0 + 8. Reply with just the integer.",
    "expected": "8",
    "base": {
      "text": "0 + 8 = 8",
      "generated_tokens": 8,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "16",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-10-15",
    "prompt": "What is 15 plus 10? Answer with only the integer.",
    "expected": "25",
    "base": {
      "text": "15 + 10 = 25",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "25",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-02-11",
    "prompt": "Add 11 and 2. Return only the integer result.",
    "expected": "13",
    "base": {
      "text": "```python\ndef add_and_multiply(a,",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "32",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-00-14",
    "prompt": "Compute 14 + 0. Reply with just the integer.",
    "expected": "14",
    "base": {
      "text": "14 + 0 = 14",
      "generated_tokens": 10,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "28",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-09-18",
    "prompt": "What is 9 plus 18? Answer with only the integer.",
    "expected": "27",
    "base": {
      "text": "To find the integer, we need to perform the addition operation",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "27",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-09-16",
    "prompt": "Add 9 and 16. Return only the integer result.",
    "expected": "25",
    "base": {
      "text": "Here is the code:\n\n```python\ndef add",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "25",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-10-20",
    "prompt": "Compute 10 + 20. Reply with just the integer.",
    "expected": "30",
    "base": {
      "text": "10 + 20 = 30",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "30",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-13-22",
    "prompt": "What is 22 plus 13? Answer with only the integer.",
    "expected": "35",
    "base": {
      "text": "To find the integer part of 22 plus 1",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "35",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-08-11",
    "prompt": "Add 8 and 11. Return only the integer result.",
    "expected": "19",
    "base": {
      "text": "```python\ndef add_and_multiply(a,",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "19",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-02-09",
    "prompt": "Compute 2 + 9. Reply with just the integer.",
    "expected": "11",
    "base": {
      "text": "2 + 9 = 11",
      "generated_tokens": 9,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "31",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-14-22",
    "prompt": "What is 14 plus 22? Answer with only the integer.",
    "expected": "36",
    "base": {
      "text": "14 + 22 = 36",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "36",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-16-22",
    "prompt": "Add 22 and 16. Return only the integer result.",
    "expected": "38",
    "base": {
      "text": "```python\ndef add_22_16(",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "38",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-07-16",
    "prompt": "Compute 16 + 7. Reply with just the integer.",
    "expected": "23",
    "base": {
      "text": "16 + 7 = 23",
      "generated_tokens": 10,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "33",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-13-21",
    "prompt": "What is 21 plus 13? Answer with only the integer.",
    "expected": "34",
    "base": {
      "text": "21 + 13 = 34",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "34",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-02-22",
    "prompt": "Add 22 and 2. Return only the integer result.",
    "expected": "24",
    "base": {
      "text": "```python\ndef add_22_2(a",
      "generated_tokens": 12,
      "terminated": false,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "34",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": false
    }
  },
  {
    "id": "add-04-07",
    "prompt": "Compute 7 + 4. Reply with just the integer.",
    "expected": "11",
    "base": {
      "text": "7 + 4 = 11",
      "generated_tokens": 9,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "11",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  },
  {
    "id": "add-12-14",
    "prompt": "What is 12 plus 14? Answer with only the integer.",
    "expected": "26",
    "base": {
      "text": "12 + 14 = 26",
      "generated_tokens": 11,
      "terminated": true,
      "valid_format": false,
      "exact_match": false
    },
    "sft": {
      "text": "26",
      "generated_tokens": 3,
      "terminated": true,
      "valid_format": true,
      "exact_match": true
    }
  }
] as const;
