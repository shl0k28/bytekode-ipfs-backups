import { config } from 'dotenv'
import { S3 } from 'aws-sdk'
import { schedule } from 'node-cron'
import { createClient } from '@supabase/supabase-js'

config()

const API_URL = `https://s3.filebase.com`
const FILEBASE_ACCESS_KEY = process.env.FILEBASE_ACCESS_KEY as string
const FILEBASE_SECRET_KEY = process.env.FILEBASE_SECRET_KEY as string
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY as string 

const awsClient = new S3({
    signatureVersion: 'v4',
    endpoint: API_URL,
    credentials: {
        accessKeyId: FILEBASE_ACCESS_KEY,
        secretAccessKey: FILEBASE_SECRET_KEY
    }
})

const supabaseClient = createClient(
    'https://qclfibrjrwjhidgbtgym.supabase.co',
    SUPABASE_SECRET_KEY    
)

const listAllBuckets = async () => {
    awsClient.listBuckets((err, data) => {
        console.log(data.Buckets![0]['Name'])
    })
}

const uploadToBucket = async (filename: string) => {
    awsClient.putObject({
        Bucket: 'bytekode-test-bucket',
        Key: `contracts/${filename}`,
        Body: 'Test',
        ContentType: 'text/plain'
    }, (err, data) => {
        console.log(data)
    })
}

const getDatabaseDetails = async () => {
    let histories = ``
    let contract = ``
    const { data: contracts, error: conErr } = await supabaseClient.from('contracts').select('*')
    console.log(contracts)
    if(conErr){
        console.log(`Error fetching contracts`)
    }
    const { data: history, error: histErr } = await supabaseClient.from('history').select('*')
    console.log(history)
    if(histErr){
        console.log(`Error fetching decoding history`)
    }
    /*
    
    history?.map((tx, index) => {
        console.log(JSON.stringify(tx))
        histories += JSON.stringify(tx)
    })
    contracts?.map((tx, index) => {
        console.log(JSON.stringify(tx))
        contract += JSON.stringify(tx)
    })
    awsClient.putObject({
        Bucket: 'bytekode-test-bucket',
        Key: `contracts/${Date.now()}`,
        Body: contract,
        ContentType: 'text/plain'
    }, (err, data) => {
        if(!err){
            awsClient.putObject({
                Bucket: 'bytekode-test-bucket',
                Key: `history/${Date.now()}`,
                Body: histories,
                ContentType: 'text/plain'  
            })
        }
    })
    */
}

// uploadToBucket('TestContract')
// getDatabaseDetails()
// runs every minute
// schedule('* * * * 1', () => console.log('Running'))

interface ContractDetails {

}
const getContractDetails = async () => {
    const { data: contracts, error: conErr } = await supabaseClient.from('contracts').select('*')
    contracts && console.log(JSON.stringify(contracts))
    // upload contract data to ipfs.
    awsClient.putObject({
        Bucket: 'bytekode-test-bucket',
        Key: `contracts/${Date.now()}`,
        Body: JSON.stringify(contracts),
        ContentType: 'application/json'
    }, (err, data) => {
        console.log(data)
    })
}

getContractDetails()