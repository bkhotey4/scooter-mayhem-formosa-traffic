using UnityEngine;

namespace ScooterMayhem.Vehicle
{
    /// <summary>
    /// WetLineDriftController - 台灣雨天熱拌標線「白線滑移」 Drift 物理系統
    /// 在狂暴雷雨天或基隆雨港，當機車輪胎壓在雙黃線、外側白線或斑馬線上時，
    /// 抓地力驟降 62%，轉向與煞車觸發街機反胎漂移、噴濺輪胎水花並獲得華麗加分。
    /// </summary>
    [RequireComponent(typeof(ScooterVehicleController))]
    public class WetLineDriftController : MonoBehaviour
    {
        [Header("Road Marking Bounds")]
        public float doubleYellowThresholdX = 0.45f;
        public float whiteBorderX = 5.5f;
        public float whiteBorderThreshold = 0.45f;
        public float crosswalkHalfLength = 4.5f;
        public float[] intersectionZ = new float[] { -90f, 0f, 90f };

        [Header("Drift Slip Settings")]
        public float wetFrictionMultiplier = 0.38f;
        public float yawSlipMultiplier = 1.65f;
        public float minDriftSpeedKmh = 20.0f;
        public float comboHoldTime = 0.65f;

        [Header("Particles & Audio")]
        public ParticleSystem waterSprayParticles;
        public AudioSource waterSplashAudio;
        public AudioClip waterSplashClip;

        public bool IsOnWetLine { get; private set; }

        private ScooterVehicleController _controller;
        private float _driftTimer;
        private float _splashCooldown;

        private void Awake()
        {
            _controller = GetComponent<ScooterVehicleController>();
        }

        private void Update()
        {
            if (_controller == null) return;

            Vector3 pos = transform.position;
            bool onDoubleYellow = Mathf.Abs(pos.x) < doubleYellowThresholdX;
            bool onWhiteBorder = Mathf.Abs(Mathf.Abs(pos.x) - whiteBorderX) < whiteBorderThreshold;
            
            bool onCrosswalk = false;
            if (Mathf.Abs(pos.x) < whiteBorderX)
            {
                foreach (float iz in intersectionZ)
                {
                    if (Mathf.Abs(pos.z - iz) < crosswalkHalfLength)
                    {
                        onCrosswalk = true;
                        break;
                    }
                }
            }

            bool onMarking = onDoubleYellow || onWhiteBorder || onCrosswalk;
            bool isWetCondition = _controller.RoadFrictionMultiplier < 0.88f;

            IsOnWetLine = onMarking && isWetCondition;

            // Apply Wet Line Slip & Water Spray
            if (IsOnWetLine && _controller.CurrentSpeedKmh > minDriftSpeedKmh)
            {
                bool isSteeringOrBraking = Mathf.Abs(_controller.SteerInput) > 0.25f || _controller.IsBraking;
                if (isSteeringOrBraking)
                {
                    if (waterSprayParticles != null && !waterSprayParticles.isPlaying)
                    {
                        waterSprayParticles.Play();
                    }

                    _splashCooldown -= Time.deltaTime;
                    if (_splashCooldown <= 0f && waterSplashAudio != null && waterSplashClip != null)
                    {
                        _splashCooldown = 0.4f;
                        waterSplashAudio.PlayOneShot(waterSplashClip);
                    }

                    _driftTimer += Time.deltaTime;
                    if (_driftTimer >= comboHoldTime)
                    {
                        string title = _controller.RoadFrictionMultiplier <= 0.7f 
                            ? "【雨港溜冰場神之漂移】白線水上漂！" 
                            : "【奪命白線滑移】極限水上漂！";
                        int pts = _controller.RoadFrictionMultiplier <= 0.7f ? 700 : 500;
                        
                        Game.AchievementSystem.Instance?.AddProgress("WET_LINE_DRIFTER", 1);
                        Debug.Log($"{title} +{pts} PTS");
                        _driftTimer = -2.5f; // Cooldown to avoid repetitive triggers
                    }
                }
                else
                {
                    StopSpray();
                    _driftTimer = Mathf.Max(0f, _driftTimer - Time.deltaTime * 2f);
                }
            }
            else
            {
                StopSpray();
                _driftTimer = Mathf.Max(0f, _driftTimer - Time.deltaTime * 2f);
            }
        }

        private void StopSpray()
        {
            if (waterSprayParticles != null && waterSprayParticles.isPlaying)
            {
                waterSprayParticles.Stop();
            }
        }
    }
}
