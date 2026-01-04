const Notification = require('../models/Notification');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    // Check both common ID field names to avoid "No new notification" issues
    const userId = req.user._id || req.user.id; 
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json(notifications);
  } catch (err) {
    console.error('Error in getNotifications:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, 
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error in markAsRead:', err);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// @desc    Helper function to create a notification 
// @usage   Used internally by bookingController, tournamentController, etc.
exports.createNotification = async (userId, message, type) => {
  try {
    // Ensure we have a valid userId before attempting to save
    if (!userId) {
      console.error('❌ Notification Error: No userId provided to createNotification');
      return;
    }

    const newNotif = new Notification({
      recipient: userId,
      message,
      type: type || 'system'
    });

    const savedNotif = await newNotif.save();
    console.log(`✅ Notification Saved: "${message}" for User: ${userId}`);
    return savedNotif;
  } catch (err) {
    console.error('❌ Notification creation failed:', err);
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
};