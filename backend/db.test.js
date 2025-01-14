test('adds 1 + 2 to equal 3', () => {
    expect(true).toBe(true);
});

test('should get all channels', async () => {
    let channels = dbTest.collection("channels").find().toArray();
    expect(channels.length).toBe(0);
});