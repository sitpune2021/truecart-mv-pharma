const BaseController = require('../../utils/baseController');
const VendorOnboardingService = require('../../services/admin/vendorOnboarding.service');
const ResponseUtil = require('../../utils/response.util');
const { processDocuments } = require('../../utils/document.utils');

class VendorOnboardingController extends BaseController {
  constructor() {
    super('VendorOnboardingController');
  }

  /**
   * Create vendor onboarding
   */
  createOnboarding = this.asyncHandler(async (req, res) => {
    const data = req.body;
    const createdBy = req.user.id;

    // Process uploaded documents if any
    if (req.files && req.files.length > 0) {
      data.documents = await processDocuments(req.files);
    }

    const onboarding = await VendorOnboardingService.createOnboarding(data, createdBy);

    await this.logActivity(
      req,
      'VENDOR_ONBOARDING_CREATE',
      `Created vendor onboarding for user ${data.user_id}`,
      'SUCCESS',
      { onboardingId: onboarding.id }
    );

    return this.sendSuccess(res, onboarding, 'Vendor onboarding created successfully', 201);
  });

  /**
   * Get all onboarding records
   */
  getAllOnboardings = this.asyncHandler(async (req, res) => {
    const { page, limit, search, status, sortBy, sortOrder } = req.query;

    const result = await VendorOnboardingService.getAllOnboardings({
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder
    });

    return this.sendPaginatedResponse(
      res,
      result.data,
      result.pagination,
      'Vendor onboardings retrieved successfully'
    );
  });

  /**
   * Get onboarding by ID
   */
  getOnboardingById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const onboarding = await VendorOnboardingService.getOnboardingById(id);

    return this.sendSuccess(res, onboarding, 'Vendor onboarding retrieved successfully');
  });

  /**
   * Get onboarding by user ID
   */
  getOnboardingByUserId = this.asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const onboarding = await VendorOnboardingService.getOnboardingByUserId(userId);

    if (!onboarding) {
      return ResponseUtil.notFound(res, 'Vendor onboarding not found for this user');
    }

    return this.sendSuccess(res, onboarding, 'Vendor onboarding retrieved successfully');
  });

  /**
   * Update onboarding
   */
  updateOnboarding = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const updatedBy = req.user.id;

    // Process uploaded documents if any
    if (req.files && req.files.length > 0) {
      const newDocuments = await processDocuments(req.files);
      data.documents = [...(data.documents || []), ...newDocuments];
    }

    const onboarding = await VendorOnboardingService.updateOnboarding(id, data, updatedBy);

    await this.logActivity(
      req,
      'VENDOR_ONBOARDING_UPDATE',
      `Updated vendor onboarding ${id}`,
      'SUCCESS',
      { onboardingId: id }
    );

    return this.sendSuccess(res, onboarding, 'Vendor onboarding updated successfully');
  });

  /**
   * Approve onboarding
   */
  approveOnboarding = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { remarks } = req.body;
    const approvedBy = req.user.id;

    const onboarding = await VendorOnboardingService.approveOnboarding(id, approvedBy, remarks);

    await this.logActivity(
      req,
      'VENDOR_ONBOARDING_APPROVE',
      `Approved vendor onboarding ${id}`,
      'SUCCESS',
      { onboardingId: id }
    );

    return this.sendSuccess(res, onboarding, 'Vendor onboarding approved successfully');
  });

  /**
   * Reject onboarding
   */
  rejectOnboarding = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { remarks } = req.body;
    const rejectedBy = req.user.id;

    if (!remarks) {
      return ResponseUtil.badRequest(res, 'Remarks are required for rejection');
    }

    const onboarding = await VendorOnboardingService.rejectOnboarding(id, rejectedBy, remarks);

    await this.logActivity(
      req,
      'VENDOR_ONBOARDING_REJECT',
      `Rejected vendor onboarding ${id}`,
      'SUCCESS',
      { onboardingId: id }
    );

    return this.sendSuccess(res, onboarding, 'Vendor onboarding rejected successfully');
  });

  /**
   * Get onboarding statistics
   */
  getOnboardingStats = this.asyncHandler(async (req, res) => {
    const stats = await VendorOnboardingService.getOnboardingStats();

    return this.sendSuccess(res, stats, 'Onboarding statistics retrieved successfully');
  });

  /**
   * Delete onboarding
   */
  deleteOnboarding = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedBy = req.user.id;

    await VendorOnboardingService.deleteOnboarding(id, deletedBy);

    await this.logActivity(
      req,
      'VENDOR_ONBOARDING_DELETE',
      `Deleted vendor onboarding ${id}`,
      'SUCCESS',
      { onboardingId: id }
    );

    return this.sendSuccess(res, null, 'Vendor onboarding deleted successfully');
  });
}

module.exports = new VendorOnboardingController();
