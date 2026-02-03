
try {
    await import('../src/lib/mongodb.js');
    console.log('SUCCESS: Import did not throw error');
} catch (error) {
    console.error('FAILURE: Import threw error:', error.message);
    process.exit(1);
}
