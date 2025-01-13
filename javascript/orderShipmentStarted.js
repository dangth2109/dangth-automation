const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const storeId = "i61f3hf";
const orderNumber = "RM-95222-48664";
const tracking = [
    {
        shippingCarrier: "USPS",
        trackingNumber: "9200190349451109829033"
    },
    {
        shippingCarrier: "USPS",
        trackingNumber: "9400136105660279740718"
    },
    {
        shippingCarrier: "USPS",
        trackingNumber: "9200190349451110057234"
    },
    
    {
        shippingCarrier: "USPS",
        trackingNumber: "9200190349451109909278"
    },
    
    {
        shippingCarrier: "USPS",
        trackingNumber: "9200190349451109834198"
    }
]

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAccessTokenPLF() {
    const url = "https://seller-staging.merchize.com/api/seller/accounts/auth/log-in";
    const body = { "email": "1c.normal.admin@foobla.com", "password": "Motchai@2024", "remember": false }
    try {
        const accessToken = await axios({
            method: 'POST',
            url,
            data: body
        })
        if (accessToken.data.data.redirect_url) {
            console.log("Get access token PLF successfull");
            const queryString = accessToken.data.data.redirect_url.split("?")[1];
            const params = new URLSearchParams(queryString);
            return params.get('accessToken');
        }
        console.log("Failed to get access token PLF");
    } catch (error) {
        console.log("Error from getAccessTokenPLF", error.message);

    }
}

async function getAccessTokenFFM() {
    const url = "https://fulfillment-staging.merchize.com/api/auth/auth/login";
    const body = {
        "username": "dangth1",
        "password": "Abcd@1234"
    }
    try {
        const response = await axios({
            method: 'POST',
            url,
            data: body
        });

        if (response.data.data.accessToken) {
            console.log("Get access token FFM successfull");
            return response.data.data.accessToken;
        }
        console.log("Failed to get access token FFM");
    } catch (error) {
        console.log("Error from getAccessTokenFFM", error.message);
    }
}

async function createOrder(){
    
}

async function getOrderIdPLF(accessTokenPLF) {
    const url = `https://bost-group-0-1.merchize.com/${storeId}/bo-api/order/v2/orders/search`;
    try {
        const orderSearch = await axios({
            method: 'POST',
            url,
            headers: { 'Authorization': `Bearer ${accessTokenPLF}` },
            data: {
                "code": orderNumber
            }
        });

        if (orderSearch.data.success && orderSearch.data.data.orders.length === 1) {
            console.log("Get order id PLF successfully", orderSearch.data.data.orders[0]._id);
            return orderSearch.data.data.orders[0]._id;
        }

        console.log("Failed to get order id PLF");
    } catch (error) {
        console.log("Error from getOrderIdPLF", error.message);

    }

}

async function getOrderIdFFM(accessToken) {
    const url = "https://fulfillment-staging.merchize.com/api/order/orders/search";
    const body = {
        "page": 1,
        "limit": 20,
        "namespace": "",
        "types": "",
        "store_mode": "",
        "payment_status": "",
        "fulfillment_status": "",
        "artwork_status": "",
        "tracking_status": "",
        "show_archive": "hide_archive",
        "shipment_status": "",
        "production_status": "all",
        "zone": "",
        "paid_at": {},
        "fulfilled_at": {},
        "completed_at": {},
        "code": orderNumber,
        "tags": "",
        "email": "",
        "customer_name": "",
        "shipping_plan": "",
        "suppliers": [],
        "platform": "",
        "has_note": "",
        "package_status": "",
        "missing_tracking": "",
        "user_mapping_email": "",
        "plf_product_title": "",
        "mapping_condition_user": "",
        "mapping_condition": "",
        "order_type": "",
        "mockup_status": "",
        "request_update_statuses": []
    }
    try {
        const response = await axios({
            method: 'POST',
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            data: body
        });
        if (response.data && response.data.data.orders.length === 1) {
            console.log("Get order id FFM by order number success", response.data.data.orders[0]._id);
            return response.data.data.orders[0]._id;
        }
        console.log("Failed to get order id FFM");
    } catch (error) {
        console.log("Error from getOrderIdFFM", error.message);
    }
}

async function getUnfulfilledItems(orderIdFFM, accessTokenFFM) {
    const url = `https://fulfillment-staging.merchize.com/api/order/orders/${orderIdFFM}/unfulfill-items`;
    try {
        const response = await axios({
            method: 'GET',
            url,
            headers: {
                Authorization: `Bearer ${accessTokenFFM}`
            }
        });

        if (response.data.data) {
            console.log("Get unfulfilled items successfull");
            return response.data.data;
        }
        console.log("Failed to get unfulfilled items");
    } catch (error) {
        console.log("Error from getUnfulfilledItems", error.message);
    }
}

async function mappingVariants(unfulfillId, accessToken) {
    const url = `https://fulfillment-staging.merchize.com/api/product/mapping/${unfulfillId}`;
    const body = {
        variant: "638ee84b5a25f9f5eee7da7e"
    };
    try {
        const response = await axios({
            method: 'POST',
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            data: body
        });

        if (response.data) {
            console.log("Mapping variants successfull");
            return response.data
        }
        console.log("Failed to mapping variants");
    } catch (error) {
        console.log("Error from mappingVariants", error.message);
    }
}

async function splitPackages(orderIdFFM, unfulfilledId, unfulfilledQuantity, accessTokenFFM) {
    const url = `https://fulfillment-staging.merchize.com/api/order/v2/orders/${orderIdFFM}/fulfill`;
    const body = {
        items: [
            {
                "_id": unfulfilledId,
                "quantity": unfulfilledQuantity
            }
        ],
        supplier: "5cf099aa3b7f1e3d46b7ae73",
        shipping_carrier: null
    }

    try {
        const response = await axios({
            method: 'POST',
            url,
            headers: {
                Authorization: `Bearer ${accessTokenFFM}`
            },
            data: body
        });

        if (response.data) {
            console.log("Split packages successfull");
            return response.data;
        }
        console.log("Failed to split packages successfull");
    } catch (error) {
        console.log("Error from splitPackages", error.message);
    }
}

async function runWebhook(orderIdFFM, accessToken) {
    const url = "https://fulfillment-staging.merchize.com/api/order/webhook-jobs/search";
    const body = {
        "order": orderIdFFM,
        "limit": 100
    };
    try {
        let hasJobsToRun = true;

        while (hasJobsToRun) {
            const getJobs = await axios({
                method: 'POST',
                url,
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                data: body
            });

            const jobs = getJobs.data.data.jobs;

            if (jobs.length > 0) {
                hasJobsToRun = false;

                for (const job of jobs) {
                    if (!job.is_sent && !job.is_failed) {
                        hasJobsToRun = true;
                        try {
                            console.log(`Job ${job._id} is not sent yet. Running job...`)
                            const runJobs = await axios({
                                method: 'POST',
                                url: `https://fulfillment-staging.merchize.com/api/order/webhook-jobs/${job._id}/run`,
                                headers: {
                                    Authorization: `Bearer ${accessToken}`
                                }
                            });

                            if (runJobs.data.success) {
                                console.log(`Run job ${job._id} successful`);
                            }
                        } catch (error) {
                            console.log(`Error running job ${job._id}:`, error.message);
                        }
                    }
                }
            } else {
                console.log("No jobs to run");
                hasJobsToRun = false;
            }

            if (hasJobsToRun) {
                console.log("Waiting for 30 seconds before checking for new jobs...");
                await delay(30000);
            }
        }

        console.log("All jobs processed");
    } catch (error) {
        console.log("Error from runWebhook:", error.message);
    }
}

async function donePrintingFiles(orderNumber, accessToken) {
    const url = `https://fulfillment-staging.merchize.com/api/order/printing-files/search`;
    const statuses = ['review', 'done']
    const getFulfillmentItems = await axios({
        method: 'POST',
        url,
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        data: {
            "page": 1,
            "limit": 10,
            "order_number": orderNumber,
            "update_design_count": "",
            "package_names": [],
            "show_archive": "hide_archive"
        }
    }).then(response => response.data.data.items);
    for (const status of statuses) {
        for (const item of getFulfillmentItems) {

            try {
                const updateStatus = await axios({
                    method: 'PUT',
                    url: `https://fulfillment-staging.merchize.com/api/order/printing-files/${item.fulfillment}/items/${item._id}/status/${status}`,
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                if (updateStatus.data) {
                    console.log(`Update status ${status} successfull`);
                }
            } catch (error) {
                console.log("Error from donePrintingFiles", error.message);
            }

        }
    }

}

async function addTrackingNumber(orderIdFFM, fulfillmentId, accessToken) {
    const randomTracking = Math.floor(Math.random() * tracking.length);
    const url = `https://fulfillment-staging.merchize.com/api/order/orders/${orderIdFFM}/fulfillments/${fulfillmentId}/tracking`;
    const body = {
        "tracking_number": tracking[randomTracking].trackingNumber,
        "tracking_company": tracking[randomTracking].shippingCarrier,
        "lock_tracking_number": false,
        "isManual": true
    }
    try {
        const addTracking = await axios({
            method: 'POST',
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            data: body
        });

        if (addTracking.data) {
            console.log("Add tracking number successfull");
            return addTracking.data;
        }

        console.log("Failed to add tracking number");
    } catch (error) {
        console.log("Error from addTrackingNumber", error.message);
    }
}

async function getFulfillments(orderId, accessToken) {
    const url = `https://fulfillment-staging.merchize.com/api/order/v2/orders/${orderId}/fulfillments`;
    try {
        const response = await axios({
            method: 'GET',
            url,
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.data.data) {
            console.log("getFulfillments successfull");
            return response.data.data;
        }

        console.log("Failed to get Fulfillments");

    } catch (error) {
        console.log("Error from getFulfillments", error.message);
    }
}

async function push(orderId, accessToken, fulfillment_ids) {
    const url = `https://fulfillment-staging.merchize.com/api/export-order/orders/${orderId}/push-fulfillments`;
    try {
        const response = await axios({
            method: 'POST',
            url,
            headers: { Authorization: `Bearer ${accessToken}` },
            data: {
                "fulfillment_ids": fulfillment_ids,
                "supplier_sheets": [
                    {
                        "sku_prefix": "1C",
                        "sheet_url": "",
                        "sheet_name": ""
                    },
                    {
                        "sku_prefix": "BG",
                        "sheet_url": "",
                        "sheet_name": ""
                    },
                    {
                        "sheet_url": "",
                        "sheet_name": ""
                    }
                ]
            }
        });
        if (response.data) {
            console.log("Push all packages successfull");
            return response.data;
        }
        console.log("Push failure");
    } catch (error) {
        console.log("Error from push", error.message);
    }
}

async function excuteQuery(orderIdFFM) {
    const uri = "mongodb://me:Uyei49vM7BzXtLp@ip-172-7-19-117.ap-southeast-1.compute.internal:27017,ip-172-7-21-98.ap-southeast-1.compute.internal:27017,ip-172-7-6-23.ap-southeast-1.compute.internal:27017/admin?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    try {
        console.log("Connecting to MongoDB...");
        await client.connect();

        const databaseName = "fulfillment";
        const collectionName = "fulfillments";
        const database = client.db(databaseName);

        const collection = database.collection(collectionName);

        const filter = { order: new ObjectId(orderIdFFM) };

        const update = {
            $set: {
                "factory_info.packaged_at": new Date("2025-01-09T07:30:00.000Z"),
                "factory_info.status": "packaged",
                "package_status": "in_transit",
                "in_production_at": new Date("2025-01-09T07:30:00.000Z"),
                "in_transit_at": new Date("2025-01-09T07:30:00.000Z"),
            },
        };

        await collection.updateMany(filter, update);
        console.log("Excute query successful")
    } catch (error) {
        console.error("Error updating documents:", error);
    } finally {
        console.log("Closing MongoDB connection...");
        await client.close();
        console.log("Connection closed.");
    }
}

async function getOrderProgress(accessTokenPLF, orderIdPLF) {
    const url = `https://bost-group-0-1.merchize.com/${storeId}/bo-api/order/orders/update-package-progress/${orderIdPLF}`;
    try {
        const response = await axios({
            method: 'GET',
            url,
            headers: {
                Authorization: `Bearer ${accessTokenPLF}`
            }

        });
        return response.data;
    } catch (error) {
        console.log(error.message);
    }
}

(async () => {
    const accessTokenPLF = await getAccessTokenPLF();
    const accessTokenFFM = await getAccessTokenFFM();

    const orderIdPLF = await getOrderIdPLF(accessTokenPLF);
    const orderIdFFM = await getOrderIdFFM(accessTokenFFM);

    const unfulfilledItems = await getUnfulfilledItems(orderIdFFM, accessTokenFFM);

    for (const unfulfillItem of unfulfilledItems) {
        await mappingVariants(unfulfillItem._id, accessTokenFFM);
    };

    for (const unfulfillItem of unfulfilledItems) {
        await splitPackages(orderIdFFM, unfulfillItem._id, unfulfillItem.quantity, accessTokenFFM);
    };

    await runWebhook(orderIdFFM, accessTokenFFM);

    await donePrintingFiles(orderNumber, accessTokenFFM);
    const fulfillments = await getFulfillments(orderIdFFM, accessTokenFFM);
    for (const fulfillment of fulfillments) {
        await addTrackingNumber(orderIdFFM, fulfillment._id, accessTokenFFM);
    }

    await runWebhook(orderIdFFM, accessTokenFFM);
    const fulfillment_ids = fulfillments.map(fulfillment => fulfillment._id);
    await push(orderIdFFM, accessTokenFFM, fulfillment_ids);
    await excuteQuery(orderIdFFM);
    await getOrderProgress(accessTokenPLF, orderIdPLF);
})();