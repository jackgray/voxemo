from sklearn.preprocessing import StandardScaler

# Flatten MFCCs into a 1D vector
mfccs_flattened = mfccs.flatten()

# Aggregate MFCCs by computing the mean over time
mfccs_mean = np.mean(mfccs, axis=1)

# Aggregate Chroma features
chroma_mean = np.mean(chroma, axis=1)


scaler = StandardScaler()

# Normalize flattened MFCCs
mfccs_normalized = scaler.fit_transform(mfccs_flattened.reshape(-1, 1)).flatten()

# Normalize aggregated features
mfccs_mean_normalized = scaler.fit_transform(mfccs_mean.reshape(-1, 1)).flatten()
chroma_mean_normalized = scaler.fit_transform(chroma_mean.reshape(-1, 1)).flatten()

# Combine features into a single embedding vector if needed
embedding_vector = np.concatenate([mfccs_normalized, chroma_mean_normalized])

