import os
import pandas as pd
import re
from collections import Counter

# Splitting a large Excel file into smaller files, with each file containing a maximum of 10,000 rows.
def split_excel_log_file(file_path, max_rows_per_chunk=10000, output_dir="Section_A/chunks_excel"):
    os.makedirs(output_dir, exist_ok=True)

    df = pd.read_excel(file_path, header=None) 
    lines = df[0].tolist()

    total_lines = len(lines)
    num_chunks = (total_lines + max_rows_per_chunk - 1) // max_rows_per_chunk

    for i in range(num_chunks):
        chunk_lines = lines[i * max_rows_per_chunk : (i + 1) * max_rows_per_chunk]
        with open(os.path.join(output_dir, f"chunk_{i}.txt"), 'w') as f:
            f.write('\n'.join(chunk_lines))

# Splitting a large txt file into smaller files, with each file containing a maximum of 10,000 rows.
def split_text_log_file(file_path, max_lines_per_chunk=10000, output_dir="Section_A/chunks_txt"):
    os.makedirs(output_dir, exist_ok=True)

    with open(file_path, 'r', encoding='utf-8') as infile:
        chunk_index = 0
        line_count = 0
        chunk_lines = []

        for line in infile:
            chunk_lines.append(line.strip())
            line_count += 1

            if line_count == max_lines_per_chunk:
                with open(os.path.join(output_dir, f"chunk_{chunk_index}.txt"), 'w', encoding='utf-8') as f:
                    f.write('\n'.join(chunk_lines))
                chunk_index += 1
                chunk_lines = []
                line_count = 0

        if chunk_lines:
            with open(os.path.join(output_dir, f"chunk_{chunk_index}.txt"), 'w', encoding='utf-8') as f:
                f.write('\n'.join(chunk_lines))

# Count the frequency of occurrence of error codes in a single file.
def count_errors_in_chunk(file_path):
    error_pattern = re.compile(r"Error:\s*([A-Z]+_\d+)")
    counter = Counter()

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            match = error_pattern.search(line)
            if match:
                error_code = match.group(1)
                counter[error_code] += 1

    return counter

# Count the frequency of occurrence of error codes in all files created from the large file.
def count_errors_in_all_chunks(chunk_dir):
    total_counter = Counter()

    for filename in os.listdir(chunk_dir):
        if filename.endswith(".txt"):
            file_path = os.path.join(chunk_dir, filename)
            chunk_counter = count_errors_in_chunk(file_path)
            total_counter.update(chunk_counter)

    return total_counter

# Final run of finding the frequencies of code occurrences and returning the N most common error codes.
def get_top_n_errors(chunk_dir, n):
    counter = count_errors_in_all_chunks(chunk_dir)

    return counter.most_common(n)


# for txt files
split_text_log_file("Section_A/logs.txt")
print(get_top_n_errors("Section_A/chunks_txt", 5))

# for excel files
split_excel_log_file("Section_A/logs.txt.xlsx")
print(get_top_n_errors("Section_A/chunks_excel", 5))