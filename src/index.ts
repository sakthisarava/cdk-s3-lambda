exports.handler = async (event: any) => {
    event.Records.forEach((record: any) => {
        console.log('Event Name: %s', record.eventName);
        console.log('S3 Request: %j', record.s3)
    });
};