using UnityEngine;
using ScooterMayhem.Vehicle;

namespace ScooterMayhem.Cameras
{
    /// <summary>
    /// Dynamic Arcade Chase Camera with longitudinal G-force inertia (拉遠/推近),
    /// cornering apex look-ahead (過彎向心前瞻點頭), speed micro-shake,
    /// and road rumble/bump shock feedback.
    /// Dual-track parity with web-prototype/src/main.js updateCamera().
    /// </summary>
    public class ArcadeChaseCamera : MonoBehaviour
    {
        [Header("Target & Tracking")]
        [SerializeField] private ScooterVehicleController targetVehicle;
        [SerializeField] private float baseDistance = 5.6f;
        [SerializeField] private float baseHeight = 2.9f;
        [SerializeField] private float followSmoothing = 11.0f;
        [SerializeField] private float lookAheadDistance = 3.4f;

        [Header("Dynamic Inertia & Weight")]
        [SerializeField] private float accelPullBackStrength = 0.075f;
        [SerializeField] private float brakeSurgeStrength = 0.065f;
        [SerializeField] private float apexLookAheadStrength = 2.1f;

        [Header("FOV Warp")]
        [SerializeField] private Camera cam;
        [SerializeField] private float baseFov = 60f;
        [SerializeField] private float maxSpeedFovAddition = 11f;

        // Runtime smoothed parameters
        private float currentHeading;
        private float currentDistance;
        private float currentHeight;
        private float currentApexOffset;
        private float cameraShakeTimer;
        private float cameraJolt;

        private void Awake()
        {
            if (cam == null) cam = GetComponent<Camera>();
            currentDistance = baseDistance;
            currentHeight = baseHeight;
            if (targetVehicle != null)
            {
                currentHeading = targetVehicle.transform.eulerAngles.y;
            }
        }

        private void LateUpdate()
        {
            if (targetVehicle == null || cam == null) return;

            float dt = Time.deltaTime;
            Vector3 vehiclePos = targetVehicle.transform.position;
            float speedKmH = targetVehicle.CurrentSpeedKmH;

            // 1. Camera Heading with speed-adaptive lag
            float targetHeading = targetVehicle.transform.eulerAngles.y;
            float headingDelta = Mathf.DeltaAngle(currentHeading, targetHeading);
            float turnLag = Mathf.Lerp(9.5f, 7.0f, Mathf.Clamp01(speedKmH / 90f));
            currentHeading += headingDelta * (1f - Mathf.Exp(-turnLag * dt));

            Quaternion headingRot = Quaternion.Euler(0f, currentHeading, 0f);
            Vector3 forward = headingRot * Vector3.forward;
            Vector3 right = headingRot * Vector3.right;

            // 2. Longitudinal G-Force Camera Weight Transfer (拉遠/推近慣性)
            float longAccel = targetVehicle.LongitudinalAccel;
            float targetDist = baseDistance;
            float targetH = baseHeight;

            if (longAccel > 0f)
            {
                // Throttle thrust: camera pulls back and lowers closer to asphalt
                targetDist = baseDistance + Mathf.Min(1.35f, longAccel * accelPullBackStrength);
                targetH = baseHeight - Mathf.Min(0.32f, longAccel * 0.018f);
            }
            else if (longAccel < 0f)
            {
                // Brake dive: camera surges forward toward handlebars, height rises
                targetDist = baseDistance - Mathf.Min(1.05f, -longAccel * brakeSurgeStrength);
                targetH = baseHeight + Mathf.Min(0.42f, -longAccel * 0.022f);
            }

            currentDistance = Mathf.Lerp(currentDistance, targetDist, dt * 6.0f);
            currentHeight = Mathf.Lerp(currentHeight, targetH, dt * 6.0f);

            // 3. Cornering Apex Look-Ahead (過彎向心前瞻點頭)
            float targetApex = -targetVehicle.CurrentLeanAngle * Mathf.Deg2Rad * apexLookAheadStrength;
            currentApexOffset = Mathf.Lerp(currentApexOffset, targetApex, dt * 5.5f);

            // 4. Speed Micro-Shake & Rumble Strip / Bump Shock Feedback
            cameraShakeTimer += dt;
            float speedShake = speedKmH > 30f ? Mathf.Min(0.018f, ((speedKmH - 30f) / 80f) * 0.018f) : 0f;
            float rumbleShake = targetVehicle.OnRumbleStrip ? 0.036f : (targetVehicle.IsOnGutter ? 0.022f : 0f);

            if (targetVehicle.CameraShakeImpulse > 0.001f)
            {
                cameraJolt = Mathf.Max(cameraJolt, targetVehicle.CameraShakeImpulse);
            }
            cameraJolt = Mathf.Lerp(cameraJolt, 0f, dt * 9.5f);

            float totalJitter = speedShake + rumbleShake + cameraJolt * 0.55f;
            float shakeX = Mathf.Sin(cameraShakeTimer * 65.0f) * totalJitter;
            float shakeY = Mathf.Cos(cameraShakeTimer * 82.0f) * totalJitter * 0.85f + (cameraJolt * 0.35f);

            // 5. Compute Camera Target Position & LookAt Target
            float suspY = targetVehicle.SuspensionY * 0.45f;
            Vector3 targetCamPos = vehiclePos
                - forward * currentDistance
                + Vector3.up * (currentHeight + suspY)
                + right * shakeX
                + Vector3.up * shakeY;

            Vector3 targetLookAt = vehiclePos
                + forward * lookAheadDistance
                + Vector3.up * (1.15f + suspY * 0.3f)
                + right * currentApexOffset;

            // Follow Lerp
            transform.position = Vector3.Lerp(transform.position, targetCamPos, Mathf.Min(1f, dt * followSmoothing));
            transform.LookAt(targetLookAt);

            // 6. Camera Bank Roll with scooter lean
            float rollAngleDeg = -targetVehicle.CurrentLeanAngle * 0.15f;
            transform.Rotate(0f, 0f, rollAngleDeg, Space.Self);

            // 7. Dynamic Speed FOV Warp
            float speedFov = (speedKmH / 100.0f) * maxSpeedFovAddition;
            float gutterFov = targetVehicle.IsOnGutter ? 4f : 0f;
            float targetFov = baseFov + speedFov + gutterFov;
            cam.fieldOfView = Mathf.Lerp(cam.fieldOfView, targetFov, dt * 6.5f);
        }
    }
}
