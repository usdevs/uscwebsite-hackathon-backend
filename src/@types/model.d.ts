type Create<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
