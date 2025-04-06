import pandas as pd
import os

# Convert a file with the xlsx extension to a csv extension as required and parquet.
# df = pd.read_excel("Section_B/time_series.xlsx") 
# df.to_csv("Section_B/time_series.csv", index=False)
# pd.read_csv("Section_B/time_series.csv").to_parquet("Section_B/time_series.parquet", index=False)

# Checking the data, while removing records with an invalid date or value, and duplicates were not removed (but how many there were was checked).
def validate_time_series(file_path):
    if file_path.lower().endswith('.csv'):
        df = pd.read_csv(file_path)
    elif file_path.lower().endswith('.parquet'):
        df = pd.read_parquet(file_path)
    else:
        raise ValueError("Unsupported file format.")

    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
    invalid_timestamps = df['timestamp'].isna().sum()
    print(f"Removed {invalid_timestamps} rows with invalid timestamps.")


    # Check duplicate rows with a number in the 'value' column:
    # duplicates = df[df.duplicated(keep=False) & df['value'].apply(lambda x: str(x).replace('.', '', 1).isdigit())]
    # duplicates = duplicates.sort_values(by=df.columns.tolist())
    # print(duplicates)
    num_numeric_duplicates = df[df.duplicated() & df['value'].apply(lambda x: str(x).replace('.', '', 1).isdigit())].shape[0]
    print(f"Numeric duplicates: {num_numeric_duplicates}.")

    duplicates = df.duplicated().sum()
    print(f"Found {duplicates} duplicate rows.")
    # df = df.drop_duplicates()

    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    missing = df.isnull().sum()
    if missing.any():
        print("Missing values found:")
        print(missing[missing > 0])
    else:
        print("No missing values.")

    df_clean = df.dropna(subset=['timestamp', 'value'])

    return df_clean

# Create a csv file containing the average values ​​for each round hour.
def compute_hourly_averages(file_path, output_file="Section_B/hourly_averages_no_split.csv"):
    df = validate_time_series(file_path)
    df['hour'] = df['timestamp'].dt.floor('h')

    hourly_avg = df.groupby('hour')['value'].mean().reset_index()
    hourly_avg.columns = ['timestamp', 'average']

    hourly_avg.to_csv(output_file, index=False)

    return hourly_avg

# call section 1

# call for CSV file
# compute_hourly_averages("Section_B/time_series.csv", "Section_B/hourly_averages_no_split.csv")

# call for parquet file
# compute_hourly_averages("Section_B/time_series.parquet", "Section_B/hourly_averages_no_split_parquet.csv")

