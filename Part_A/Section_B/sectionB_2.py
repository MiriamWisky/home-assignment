from concurrent.futures import ThreadPoolExecutor
import pandas as pd
import os
import time

# Reading the data in parts, cleaning it and dividing it into small files by days.
def split_csv_by_day(file_path, output_dir='Section_B/daily_parts'):
    os.makedirs(output_dir, exist_ok=True)

    is_parquet = file_path.lower().endswith('.parquet')

    if is_parquet:
        df = pd.read_parquet(file_path)
        chunks = [df]
    else:
        chunks = pd.read_csv(file_path, chunksize=10_000)

    for chunk in chunks:
        chunk['timestamp'] = pd.to_datetime(chunk['timestamp'], errors='coerce')
        chunk['value'] = pd.to_numeric(chunk['value'], errors='coerce')

        # before = len(chunk)
        chunk = chunk.dropna(subset=['timestamp', 'value']).copy()
        # after = len(chunk)
        # if before > after:
            # print(f"Dropped {before - after} invalid rows in current chunk.")

        chunk['date'] = chunk['timestamp'].dt.date

        for date, group in chunk.groupby('date'):
            filename = os.path.join(output_dir, f'day_{date}.csv')
            group.drop(columns='date').to_csv(
                filename,
                mode='a',
                header=not os.path.exists(filename),
                index=False
            )


# Calculating the average value of the values ​​per hour for a specific file, the result is saved in another file - all this with the help of threads.
def process_file(filename, input_dir, output_dir):
    if not filename.endswith('.csv'):
        return

    file_path = os.path.join(input_dir, filename)

    try:
        df = pd.read_csv(file_path, parse_dates=['timestamp'])
    except Exception as e:
        print(f"Failed to read {filename}: {e}")
        return

    if df.empty:
        print(f"Skipping empty file: {filename}")
        return

    df['hour'] = df['timestamp'].dt.floor('h')
    hourly_avg = df.groupby('hour')['value'].mean().reset_index()
    hourly_avg.columns = ['timestamp', 'average']

    out_path = os.path.join(output_dir, f'avg_{filename}')
    hourly_avg.to_csv(out_path, index=False)

# Definition of the threads and the executive function.
def compute_all_daily_hourly_averages(input_dir='Section_B/daily_parts', output_dir='Section_B/daily_avgs'):
    os.makedirs(output_dir, exist_ok=True)
    files = [f for f in os.listdir(input_dir) if f.endswith('.csv')]

    with ThreadPoolExecutor(max_workers=4) as executor:
        for f in files:
            executor.submit(process_file, f, input_dir, output_dir)


# Combining the results from all files into a final csv file.
def combine_all_results(input_dir='Section_B/daily_avgs', output_file='Section_B/final_hourly_averages_split.csv'):
    import os
    import pandas as pd

    first = True

    with open(output_file, 'w', newline='', encoding='utf-8') as out_file:
        for filename in sorted(os.listdir(input_dir)):
            if not filename.endswith('.csv'):
                continue

            path = os.path.join(input_dir, filename)

            try:
                df = pd.read_csv(path, parse_dates=['timestamp'])
            except Exception as e:
                print(f"Failed to read {filename}: {e}")
                continue

            df = df.sort_values('timestamp')  # לוודא שהקובץ ממויין

            df.to_csv(out_file, index=False, header=first, mode='a')
            first = False

# A function that centralizes all readings together.
def generate_hourly_averages_from_file(
    input_file,
    daily_parts_dir='Section_B/daily_parts',
    daily_avgs_dir='Section_B/daily_avgs',
    output_file='Section_B/final_hourly_averages_split.csv'
):

    print(f"Splitting input file into daily chunks: {input_file}")
    split_csv_by_day(input_file, output_dir=daily_parts_dir)

    print(f"Computing hourly averages in: {daily_parts_dir}")
    compute_all_daily_hourly_averages(input_dir=daily_parts_dir, output_dir=daily_avgs_dir)

    print(f"Combining results into: {output_file}")
    combine_all_results(input_dir=daily_avgs_dir, output_file=output_file)

# call section B - 2

# call with csv file
generate_hourly_averages_from_file("Section_B/time_series.csv")

# call with parquet file
generate_hourly_averages_from_file("Section_B/time_series.parquet", daily_parts_dir='Section_B/daily_parts_parquet', daily_avgs_dir='Section_B/daily_avgs_parquet', output_file='Section_B/final_hourly_averages_split_parquet.csv')
