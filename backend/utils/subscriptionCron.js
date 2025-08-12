const cron = require('node-cron');
const Store = require('../models/storeModel'); // adjust path to your Store model

// Function to start the cron job
const startSubscriptionCron = () => {
  cron.schedule('0 */5 * * *', async () => {
    try {
      const now = new Date();
      const expiredStores = await Store.find({
        validTill: { $lt: now },
        subscription: { $ne: 'basic' }
      });

      if (expiredStores.length > 0) {
        // Update subscriptions
        await Store.updateMany(
          { _id: { $in: expiredStores.map(store => store._id) } },
          { $set: { subscription: 'basic' } }
        );

        console.log(`✅ Downgraded ${expiredStores.length} stores:`);
        expiredStores.forEach(store => {
          console.log(`   - ${store.storeName}`);
        });
      } else {
        console.log('ℹ️ No subscriptions needed updating.');
      }
    } catch (error) {
      console.error('❌ Error updating subscriptions:', error);
    }
  });
};

module.exports = startSubscriptionCron;
