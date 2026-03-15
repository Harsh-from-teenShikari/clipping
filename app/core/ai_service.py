import asyncio
from app.db import SessionLocal
from app.modules.campaign import Campaign
from app.modules.dashboard_models import Submission, VerifiedSubmission
from app.core.parsers import extract_views

class AiService:
    async def evaluate_submission(self, payload: dict):
        # Automated Verification Flow
        campaign_id = payload.get("campaign_id")
        content_url = payload.get("content_url")
        creator_id = payload.get("creator_id")
        submission_id = payload.get("submission_id")
        
        print(f"AI Service: Starting evaluation for submission {submission_id} in campaign {campaign_id}")
        
        # Simulate some processing time
        await asyncio.sleep(2)
        
        db = SessionLocal()
        try:
            # 1. Fetch Campaign details
            campaign = db.query(Campaign).filter_by(id=campaign_id).first()
            if not campaign:
                print(f"AI Service: Campaign {campaign_id} not found")
                return

            # 2. Extract views based on platform
            views = extract_views(campaign.platform, content_url)
            print(f"AI Service: Extracted {views} views for {content_url} on {campaign.platform}")

            # 3. Check if views >= target_metric
            passed = views >= (campaign.target_metric or 0)
            
            # 4. Update original submission
            submission = db.query(Submission).filter_by(id=submission_id).first()
            if submission:
                submission.status = "approved" if passed else "rejected"
                db.add(submission)

            # 5. If passed, create VerifiedSubmission entry
            if passed:
                verified = VerifiedSubmission(
                    creator_id=creator_id,
                    post_link=content_url,
                    submitter=creator_id, # As discussed, creator_id is the submitter
                    campaign_id=campaign_id,
                    passed=True
                )
                db.add(verified)
                print(f"AI Service: Verification PASSED for {content_url}")
            else:
                print(f"AI Service: Verification FAILED for {content_url} (Views: {views}, Target: {campaign.target_metric})")

            db.commit()
        except Exception as e:
            print(f"AI Service Error: {e}")
            db.rollback()
        finally:
            db.close()
        
        print(f"AI Service: Evaluation completed for {content_url}")

ai_service = AiService()
