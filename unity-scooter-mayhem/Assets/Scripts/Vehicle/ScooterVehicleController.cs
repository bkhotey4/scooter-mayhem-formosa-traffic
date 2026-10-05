using System;
using UnityEngine;

namespace ScooterMayhem.Vehicle
{
    /// <summary>
    /// Arcade 2-Wheel Scooter Vehicle Controller with dynamic weight transfer (點頭/後沉),
    /// suspension spring simulation (避震器彈簧), road surface feedback, leaning (壓車),
    /// drifting, gutter running (水溝蓋跑法), and squeeze-through combos.
    /// Dual-track parity with web-prototype/src/physics/ScooterController.js.
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public class ScooterVehicleController : MonoBehaviour
    {
        [Header("Engine & Speed")]
        [SerializeField] private float acceleration = 22f;
        [SerializeField] private float topSpeedKmH = 75f;
        [SerializeField] private float gutterBoostSpeedKmH = 95f;
        [SerializeField] private float brakeForce = 35f;
        [SerializeField] private float reverseSpeedKmH = 18f;

        [Header("Steering & Leaning (壓車物理)")]
        [SerializeField] private float steerSensitivity = 65f;
        [SerializeField] private float maxLeanAngleDeg = 32f;
        [SerializeField] private float leanSmoothSpeed = 10f;
        [SerializeField] private Transform visualChassis;
        [SerializeField] private Transform steeringHandlebar;
        [SerializeField] private Transform frontWheelMesh;
        [SerializeField] private Transform rearWheelMesh;

        [Header("Suspension & Weight Inertia (懸吊避震與動態重量感)")]
        [SerializeField] private Transform riderMesh;
        [SerializeField] private float pitchSpringK = 42.0f;
        [SerializeField] private float pitchDamp = 9.0f;
        [SerializeField] private float vertSpringK = 65.0f;
        [SerializeField] private float vertDamp = 11.5f;

        [Header("Audio & Effects")]
        [SerializeField] private ParticleSystem tireSmokeParticles;
        [SerializeField] private ParticleSystem gutterSparkParticles;
        [SerializeField] private AudioSource engineAudio;
        [SerializeField] private AudioSource hornAudio;
        [SerializeField] private AudioSource suspensionAudio;
        [SerializeField] private AudioSource rumbleAudio;

        // Runtime states
        private Rigidbody rb;
        private float currentSteerInput;
        private float currentThrottleInput;
        private bool isDrifting;
        private float currentLeanAngle;
        private bool isOnGutter;
        private bool isCrashed;

        // Weight transfer & suspension dynamics
        private float suspensionPitch;
        private float suspensionPitchVel;
        private float suspensionY;
        private float suspensionYVel;
        private float longitudinalAccel;
        private float prevSpeed;
        private float engineVibePhase;
        private float cameraShakeImpulse;
        private float bumpJolt;
        private bool onRumbleStrip;
        private float rumblePhase;
        private float lastRumbleSoundTime;

        public float CurrentSpeedKmH => rb != null ? rb.linearVelocity.magnitude * 3.6f : 0f;
        public float CurrentLeanAngle => currentLeanAngle;
        public float YawAngularVelocity => rb != null ? rb.angularVelocity.y : 0f;
        public bool IsOnGutter => isOnGutter;
        public bool IsCrashed => isCrashed;

        public float SuspensionPitch => suspensionPitch;
        public float SuspensionY => suspensionY;
        public float LongitudinalAccel => longitudinalAccel;
        public float CameraShakeImpulse { get => cameraShakeImpulse; set => cameraShakeImpulse = value; }
        public float BumpJolt { get => bumpJolt; set => bumpJolt = value; }
        public bool OnRumbleStrip => onRumbleStrip;

        public event Action<string, int> OnComboTriggered;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.centerOfMass = new Vector3(0, -0.4f, 0); // Low center of gravity for stable arcade feel
        }

        private void Update()
        {
            if (isCrashed) return;

            // Player Inputs (WASD / Arrows / Gamepad)
            currentThrottleInput = Input.GetAxis("Vertical");
            currentSteerInput = Input.GetAxis("Horizontal");
            isDrifting = Input.GetButton("Jump"); // Spacebar

            if (Input.GetKeyDown(KeyCode.H))
            {
                PlayHorn();
            }

            UpdateVisualTransforms();
            UpdateAudio();
        }

        private void FixedUpdate()
        {
            if (isCrashed) return;

            ApplyDrivePhysics();
            ApplySteeringPhysics();
            ApplyGutterCheck();
            ApplySuspensionDynamics();
        }

        private void ApplyDrivePhysics()
        {
            float maxSpeed = isOnGutter ? (gutterBoostSpeedKmH / 3.6f) : (topSpeedKmH / 3.6f);
            float currentSpeed = Vector3.Dot(rb.linearVelocity, transform.forward);

            if (currentThrottleInput > 0f && currentSpeed < maxSpeed)
            {
                rb.AddForce(transform.forward * (acceleration * currentThrottleInput), ForceMode.Acceleration);
            }
            else if (currentThrottleInput < 0f)
            {
                if (currentSpeed > 1f)
                {
                    // Braking
                    rb.AddForce(-transform.forward * brakeForce, ForceMode.Acceleration);
                }
                else if (currentSpeed > -(reverseSpeedKmH / 3.6f))
                {
                    // Reverse
                    rb.AddForce(transform.forward * (acceleration * 0.5f * currentThrottleInput), ForceMode.Acceleration);
                }
            }

            // Drifting lateral friction modification
            Vector3 lateralVelocity = transform.right * Vector3.Dot(rb.linearVelocity, transform.right);
            float lateralDamping = isDrifting ? 0.92f : 0.82f;
            rb.linearVelocity -= lateralVelocity * (1f - lateralDamping);

            if (isDrifting && Mathf.Abs(CurrentSpeedKmH) > 20f && tireSmokeParticles != null && !tireSmokeParticles.isPlaying)
            {
                tireSmokeParticles.Play();
            }
        }

        private void ApplySteeringPhysics()
        {
            float speedRatio = Mathf.Clamp01(CurrentSpeedKmH / 40f);
            float turnMultiplier = isDrifting ? 1.4f : 1.0f;
            float yawAmount = currentSteerInput * steerSensitivity * turnMultiplier * speedRatio;

            // Yaw rotation
            Quaternion turnRotation = Quaternion.Euler(0f, yawAmount * Time.fixedDeltaTime, 0f);
            rb.MoveRotation(rb.rotation * turnRotation);

            // Dynamic Leaning (壓車)
            float targetLean = -currentSteerInput * maxLeanAngleDeg * speedRatio;
            if (isDrifting)
            {
                // Counter-steering lean
                targetLean *= -0.5f;
            }

            currentLeanAngle = Mathf.Lerp(currentLeanAngle, targetLean, Time.fixedDeltaTime * leanSmoothSpeed);
        }

        private void ApplySuspensionDynamics()
        {
            float dt = Time.fixedDeltaTime;
            float forwardSpeed = Vector3.Dot(rb.linearVelocity, transform.forward);

            // 1. Longitudinal acceleration tracking
            longitudinalAccel = (forwardSpeed - prevSpeed) / Mathf.Max(dt, 0.001f);
            prevSpeed = forwardSpeed;

            // 2. Weight Transfer Pitch Target: Accel Squat (-pitch) vs Brake Dive (+pitch)
            float targetPitch = 0f;
            if (longitudinalAccel > 0f)
            {
                // Accel Squat (車尾下沉後座受力)
                targetPitch = -Mathf.Min(0.045f, longitudinalAccel * 0.0028f);
            }
            else if (longitudinalAccel < 0f)
            {
                // Brake Dive (前懸吊壓縮點頭)
                targetPitch = Mathf.Min(0.075f, -longitudinalAccel * 0.0042f);
            }

            // Torsional spring damper simulation
            float pitchForce = -pitchSpringK * (suspensionPitch - targetPitch) - pitchDamp * suspensionPitchVel;
            suspensionPitchVel += pitchForce * dt;
            suspensionPitch += suspensionPitchVel * dt;

            // 3. Road Surface Texture & Rumble Chatter
            float speedKmH = CurrentSpeedKmH;
            float roadTexture = 0f;
            if (speedKmH > 3f)
            {
                roadTexture = Mathf.Sin(transform.position.z * 18f) * 0.005f + Mathf.Sin(transform.position.x * 24f) * 0.003f;
            }

            // Rumble stripes detection (e.g. over crosswalks or road markers)
            float currentBump = bumpJolt;
            if (isOnGutter)
            {
                currentBump = Mathf.Max(currentBump, 0.06f + UnityEngine.Random.value * 0.09f);
            }
            else if (onRumbleStrip && speedKmH > 6f)
            {
                rumblePhase += dt * Mathf.Min(48f, speedKmH * 3.8f);
                float chatter = Mathf.Sin(rumblePhase) * 0.018f;
                roadTexture += chatter;
                cameraShakeImpulse = Mathf.Max(cameraShakeImpulse, 0.038f);

                if (Mathf.Sin(rumblePhase) > 0.82f && Time.time - lastRumbleSoundTime > 0.095f)
                {
                    if (rumbleAudio != null) rumbleAudio.PlayOneShot(rumbleAudio.clip);
                    lastRumbleSoundTime = Time.time;
                }
            }

            // Add bump impulses from potholes/curbs
            if (currentBump > 0.01f)
            {
                suspensionYVel += currentBump * 2.2f;
                cameraShakeImpulse = Mathf.Max(cameraShakeImpulse, currentBump * 0.85f);
                if (currentBump > 0.28f && suspensionAudio != null)
                {
                    suspensionAudio.PlayOneShot(suspensionAudio.clip);
                }
            }
            bumpJolt = Mathf.MoveTowards(currentBump, 0f, 10f * dt);

            // Vertical suspension spring simulation
            float vertForce = -vertSpringK * (suspensionY - roadTexture) - vertDamp * suspensionYVel;
            suspensionYVel += vertForce * dt;
            suspensionY += suspensionYVel * dt;
            suspensionY = Mathf.Clamp(suspensionY, -0.05f, 0.07f);

            // Engine mechanical vibration (Idle buzzing at 16Hz, High-RPM buzz)
            engineVibePhase += dt;
            bool isIdle = speedKmH < 1f;
            float vibeFreq = isIdle ? 16f : (24f + speedKmH * 0.35f);
            float vibeAmp = isIdle ? 0.0028f : Mathf.Min(0.0055f, 0.0015f + (speedKmH / 90f) * 0.004f);
            float engineVibeY = Mathf.Sin(engineVibePhase * vibeFreq) * vibeAmp;

            // Camera shake impulse damp
            cameraShakeImpulse = Mathf.MoveTowards(cameraShakeImpulse, 0f, 11f * dt);
        }

        private void UpdateVisualTransforms()
        {
            float speedKmH = CurrentSpeedKmH;
            bool isIdle = speedKmH < 1f;
            float vibeFreq = isIdle ? 16f : (24f + speedKmH * 0.35f);
            float vibeAmp = isIdle ? 0.0028f : Mathf.Min(0.0055f, 0.0015f + (speedKmH / 90f) * 0.004f);
            float engineVibeY = Mathf.Sin(engineVibePhase * vibeFreq) * vibeAmp;
            float engineVibeRoll = Mathf.Cos(engineVibePhase * vibeFreq * 1.2f) * vibeAmp * 0.4f * Mathf.Rad2Deg;

            // Chassis leaning + pitch squat/dive + engine vibration
            if (visualChassis != null)
            {
                visualChassis.localPosition = new Vector3(0f, suspensionY + engineVibeY, 0f);
                visualChassis.localRotation = Quaternion.Euler(
                    suspensionPitch * Mathf.Rad2Deg,
                    0f,
                    currentLeanAngle + engineVibeRoll
                );
            }

            // Steering handlebar yaw articulation
            if (steeringHandlebar != null)
            {
                steeringHandlebar.localRotation = Quaternion.Euler(0f, currentSteerInput * 25f, 0f);
            }

            // Spin wheels with decoupled yaw/pitch
            float rotAngle = (CurrentSpeedKmH / 3.6f) * Time.deltaTime / 0.25f * Mathf.Rad2Deg;
            if (frontWheelMesh != null)
            {
                frontWheelMesh.localRotation = Quaternion.Euler(0f, currentSteerInput * 25f, 0f) *
                                              Quaternion.Euler(frontWheelMesh.localEulerAngles.x + rotAngle, 0f, 0f);
            }
            if (rearWheelMesh != null)
            {
                rearWheelMesh.Rotate(Vector3.right, rotAngle, Space.Self);
            }

            // Dynamic Rider Posture (騎士重心動態移轉、風阻前傾與避震緩衝)
            if (riderMesh != null)
            {
                float speedTuck = speedKmH > 45f ? Mathf.Min(0.09f, (speedKmH - 45f) / 100f * 0.12f) : 0f;
                float riderPitch = -suspensionPitch * 0.65f - (currentThrottleInput > 0f ? 0.06f : 0f) + (currentThrottleInput < 0f ? 0.08f : 0f) - speedTuck;

                riderMesh.localPosition = new Vector3(
                    -Mathf.Sin(currentLeanAngle * Mathf.Deg2Rad) * 0.04f,
                    0.78f + engineVibeY * 0.35f + (suspensionY * 0.45f),
                    0f
                );
                riderMesh.localRotation = Quaternion.Euler(
                    riderPitch * Mathf.Rad2Deg,
                    0f,
                    -currentLeanAngle * 0.35f
                );
            }
        }

        private void ApplyGutterCheck()
        {
            // Raycast check down to detect RoadGutter layer
            bool wasOnGutter = isOnGutter;
            isOnGutter = Physics.Raycast(transform.position + Vector3.up * 0.2f, Vector3.down, out RaycastHit hit, 0.8f, LayerMask.GetMask("GutterTrack"));

            if (isOnGutter)
            {
                if (!wasOnGutter)
                {
                    OnComboTriggered?.Invoke("水溝蓋跑法加速！", 800);
                }

                if (gutterSparkParticles != null && !gutterSparkParticles.isPlaying)
                {
                    gutterSparkParticles.Play();
                }
            }
            else
            {
                if (gutterSparkParticles != null && gutterSparkParticles.isPlaying)
                {
                    gutterSparkParticles.Stop();
                }
            }
        }

        public void SetRumbleStripState(bool active)
        {
            onRumbleStrip = active;
        }

        public void TriggerCrashWipeout(Vector3 impactDir, float force = 15f)
        {
            if (isCrashed) return;
            isCrashed = true;
            rb.linearVelocity = -impactDir.normalized * (force * 0.4f) + Vector3.up * (force * 0.2f);
            rb.AddTorque(UnityEngine.Random.insideUnitSphere * 20f, ForceMode.Impulse);

            Invoke(nameof(RecoverFromCrash), 2.0f);
        }

        private void RecoverFromCrash()
        {
            isCrashed = false;
            transform.rotation = Quaternion.Euler(0, transform.rotation.eulerAngles.y, 0);
        }

        public void PlayHorn()
        {
            if (hornAudio != null) hornAudio.Play();
        }

        private void UpdateAudio()
        {
            if (engineAudio != null)
            {
                float normSpeed = Mathf.Clamp01(CurrentSpeedKmH / topSpeedKmH);
                engineAudio.pitch = Mathf.Lerp(0.85f, 2.2f, normSpeed);
            }
        }
    }
}
