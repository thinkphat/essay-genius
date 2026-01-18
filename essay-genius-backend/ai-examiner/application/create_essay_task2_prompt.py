import base64
import os
from google import genai
from google.genai import types

from dotenv import load_dotenv

load_dotenv()


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = os.environ.get("GEMINI_MODEL")
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(
                    text="""You are an IELTS examiner assistant.

Your job is to generate one IELTS Writing Task 2 prompt in correct academic format.

Input:
A list of topics (can be empty), e.g.:
[\"education\", \"technology\", \"environment\"]
or []

Rules:

If the topic list is not empty, randomly select one topic from the list and write a relevant IELTS Writing Task 2 question.

If the topic list is empty, choose a common IELTS topic yourself (e.g., education, society, health, technology, environment, globalization, crime).

The question must follow official IELTS Task 2 styles such as:

\"Some people believe that... while others think that... Discuss both views and give your own opinion.\"

\"To what extent do you agree or disagree?\"

\"What are the causes of this problem and what solutions can be proposed?\"

\"Do the advantages outweigh the disadvantages?\"

Output format:

{
  \"essay_prompt\": \"Your generated IELTS Writing Task 2 question here\"
}
"""
                ),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(
                    text="""The user wants an IELTS Writing Task 2 prompt.

1.  **Check the input list:** Is the list of topics empty or not?
2.  **If the list is NOT empty:**
    *   Randomly select one topic from the provided list.
    *   Generate an IELTS Task 2 question related to that topic, using one of the standard formats (Discuss both views, Agree/Disagree, Causes/Solutions, Advantages/Disadvantages).
3.  **If the list IS empty:**
    *   Choose a common IELTS topic (e.g., education, society, health, technology, environment, globalization, crime, work, family, travel, culture, media).
    *   Generate an IELTS Task 2 question related to the chosen topic, using one of the standard formats.
4.  **Format the output:** Present the generated question within a JSON structure with the key \"essay_prompt\".

**Scenario 1: Input list is [\"education\", \"technology\", \"environment\"]**

*   Randomly select one: Let's say \"technology\".
*   Choose a question format: Let's use \"Do the advantages outweigh the disadvantages?\".
*   Generate question: \"Modern technology allows people to work and study from home. Do the advantages of this trend outweigh the disadvantages?\"
*   Format output:
    ```json
    {
      \"essay_prompt\": \"Modern technology allows people to work and study from home. Do the advantages of this trend outweigh the disadvantages?\"
    }
    ```

**Scenario 2: Input list is []**

*   Choose a common topic: Let's pick \"society\" or more specifically, \"community\".
*   Choose a question format: Let's use \"To what extent do you agree or disagree?\".
*   Generate question: \"Some people argue that individuals have become more independent and less reliant on their local communities. To what extent do you agree or disagree with this view?\"
*   Format output:
    ```json
    {
      \"essay_prompt\": \"Some people argue that individuals have become more independent and less reliant on their local communities. To what extent do you agree or disagree with this view?\"
    }
    ```

**Scenario 3: Input list is [\"health\"]**

*   Select the topic: \"health\".
*   Choose a question format: Let's use \"Causes/Solutions\".
*   Generate question: \"Levels of stress are increasing in modern society, leading to significant health problems. What are the main causes of this stress, and what measures could be taken to address it?\"
*   Format output:
    ```json
    {
      \"essay_prompt\": \"Levels of stress are increasing in modern society, leading to significant health problems. What are the main causes of this stress, and what measures could be taken to address it?\"
    }
    ```

**Scenario 4: Input list is [\"globalization\", \"culture\"]**

*   Randomly select one: Let's say \"globalization\".
*   Choose a question format: Let's use \"Discuss both views and give your own opinion.\"
*   Generate question: \"Some people believe that globalization leads to the loss of cultural identity, while others think it enriches local cultures. Discuss both views and give your own opinion.\"
*   Format output:
    ```json
    {
      \"essay_prompt\": \"Some people believe that globalization leads to the loss of cultural identity, while others think it enriches local cultures. Discuss both views and give your own opinion.\"
    }
    ```

Let's implement the logic considering the input list provided by the user."""
                ),
                types.Part.from_text(
                    text="""```json
{
  \"essay_prompt\": \"Some people believe that unpaid community service should be a compulsory part of high school programmes (for example, working for a charity, improving the neighbourhood or teaching sports to younger children). To what extent do you agree or disagree?\"
}
```"""
                ),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")


if __name__ == "__main__":
    generate()
