using System;
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    public enum RailwayCrossingState
    {
        Idle,
        Lowering,
        Crossing,
        Raising
    }

    /// <summary>
    /// RailwayLevelCrossingAI (台鐵路面平交道「叮咚噹」警報遮斷桿與自強號急速呼嘯)
    /// Models authentic Taiwanese railway level crossing encounters:
    /// - Alternating red flashers and ding-dong warning bell.
    /// - Striped descending barriers.
    /// - High-speed TRA Express Train (EMU3000 / Tze-Chiang) rushing across tracks at ~115 km/h.
    /// - Waiting safely awards "【平交道停看聽楷模】" (+600 PTS).
    /// - Racing right ahead of the train awards "【平交道極限生死時速！】" (+2000 PTS).
    /// - Getting hit launches the scooter with extreme collision impact and $2000 fine.
    /// </summary>
    public class RailwayLevelCrossingAI : MonoBehaviour
    {
        [Header("Railway Geometry")]
        [SerializeField] private float crossingZ = -45.0f;
        [SerializeField] private Transform[] barrierPivots;
        [SerializeField] private MeshRenderer[] flashingRedLamps;
        [SerializeField] private Transform trainTransform;

        [Header("Train Dynamics")]
        [SerializeField] private float trainSpeed = 34.0f; // ~122 km/h
        [SerializeField] private float trainStartX = -85.0f;
        [SerializeField] private float trainEndX = 85.0f;

        [Header("Audio & FX")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip bellDingDongClip;
        [SerializeField] private AudioClip trainHornClip;

        // State Machine
        private RailwayCrossingState state = RailwayCrossingState.Idle;
        private float stateTimer = 16.0f;
        private float bellTimer = 0f;
        private int flasherPhase = 0;
        private float currentTrainX = -85.0f;

        // Scoring flags
        private bool yieldAwarded = false;
        private bool daringAwarded = false;

        public RailwayCrossingState CurrentState => state;

        public event Action<string, int> OnSafeYieldSuccess;
        public event Action<string, int> OnDaringCrossSuccess;
        public event Action<string, int> OnTrainCollision;

        private void Start()
        {
            state = RailwayCrossingState.Idle;
            stateTimer = 16.0f;
            SetBarrierAngle(1.0f); // Upright open
            SetFlashersActive(false);
            if (trainTransform != null) trainTransform.gameObject.SetActive(false);
        }

        private void Update()
        {
            float dt = Time.deltaTime;
            stateTimer -= dt;

            switch (state)
            {
                case RailwayCrossingState.Idle:
                    SetBarrierAngle(1.0f);
                    SetFlashersActive(false);
                    if (trainTransform != null) trainTransform.gameObject.SetActive(false);

                    if (stateTimer <= 0f)
                    {
                        state = RailwayCrossingState.Lowering;
                        stateTimer = 4.5f;
                        bellTimer = 0f;
                        flasherPhase = 0;
                        yieldAwarded = false;
                        daringAwarded = false;
                    }
                    break;

                case RailwayCrossingState.Lowering:
                    float progress = Mathf.Clamp01(stateTimer / 4.5f);
                    SetBarrierAngle(progress);

                    // Bell & Flashing lights
                    bellTimer += dt;
                    if (bellTimer > 0.45f)
                    {
                        bellTimer = 0f;
                        flasherPhase++;
                        if (audioSource != null && bellDingDongClip != null)
                        {
                            audioSource.PlayOneShot(bellDingDongClip);
                        }
                    }
                    UpdateFlashers(flasherPhase);

                    if (stateTimer <= 0f)
                    {
                        state = RailwayCrossingState.Crossing;
                        stateTimer = 4.2f;
                        currentTrainX = trainStartX;
                        if (trainTransform != null)
                        {
                            trainTransform.gameObject.SetActive(true);
                            trainTransform.position = new Vector3(currentTrainX, 0f, crossingZ);
                        }
                        if (audioSource != null && trainHornClip != null)
                        {
                            audioSource.PlayOneShot(trainHornClip);
                        }
                    }
                    break;

                case RailwayCrossingState.Crossing:
                    SetBarrierAngle(0.0f); // Fully lowered

                    bellTimer += dt;
                    if (bellTimer > 0.45f)
                    {
                        bellTimer = 0f;
                        flasherPhase++;
                    }
                    UpdateFlashers(flasherPhase);

                    // Move train
                    currentTrainX += trainSpeed * dt;
                    if (trainTransform != null)
                    {
                        trainTransform.position = new Vector3(currentTrainX, 0f, crossingZ);
                    }

                    if (stateTimer <= 0f || currentTrainX > trainEndX)
                    {
                        state = RailwayCrossingState.Raising;
                        stateTimer = 3.0f;
                        if (trainTransform != null) trainTransform.gameObject.SetActive(false);
                    }
                    break;

                case RailwayCrossingState.Raising:
                    float raiseProgress = 1.0f - Mathf.Clamp01(stateTimer / 3.0f);
                    SetBarrierAngle(raiseProgress);
                    SetFlashersActive(false);

                    if (stateTimer <= 0f)
                    {
                        state = RailwayCrossingState.Idle;
                        stateTimer = 35.0f;
                    }
                    break;
            }
        }

        public void CheckPlayerInteraction(Vector3 playerPos, float speedKmH, bool isCrashed)
        {
            if (isCrashed) return;

            // Safe stop yield before barrier
            if (state == RailwayCrossingState.Lowering || state == RailwayCrossingState.Crossing)
            {
                float distZ = Mathf.Abs(playerPos.z - crossingZ);
                if (distZ < 5.0f && distZ > 2.0f && speedKmH < 4.0f && !yieldAwarded)
                {
                    yieldAwarded = true;
                    OnSafeYieldSuccess?.Invoke("【平交道停看聽楷模】安全第一！", 600);
                }
            }

            // Train passing interactions
            if (state == RailwayCrossingState.Crossing)
            {
                bool onTrackZ = Mathf.Abs(playerPos.z - crossingZ) < 1.8f;
                bool trainOverlapX = Mathf.Abs(playerPos.x - currentTrainX) < 13.0f;

                // Hit by train
                if (onTrackZ && trainOverlapX)
                {
                    OnTrainCollision?.Invoke("【強闖平交道遭火車衝撞】送醫重罰 $2000！", 2000);
                    return;
                }

                // Daring close-call escape right ahead of train
                if (!daringAwarded && onTrackZ && speedKmH > 38.0f)
                {
                    float deltaX = playerPos.x - currentTrainX;
                    if (deltaX > 13.0f && deltaX < 22.0f)
                    {
                        daringAwarded = true;
                        OnDaringCrossSuccess?.Invoke("【平交道極限生死時速！】神速擦身！", 2000);
                    }
                }
            }
        }

        private void SetBarrierAngle(float normalizedAngle)
        {
            // 1.0 = upright 90 deg, 0.0 = horizontal 0 deg
            if (barrierPivots != null)
            {
                for (int i = 0; i < barrierPivots.Length; i++)
                {
                    if (barrierPivots[i] != null)
                    {
                        float sign = i == 0 ? 1f : -1f;
                        barrierPivots[i].localRotation = Quaternion.Euler(0f, 0f, sign * normalizedAngle * 90f);
                    }
                }
            }
        }

        private void SetFlashersActive(bool active)
        {
            if (flashingRedLamps != null)
            {
                foreach (var lamp in flashingRedLamps)
                {
                    if (lamp != null)
                    {
                        lamp.material.SetColor("_EmissionColor", active ? Color.red * 2.5f : Color.black);
                    }
                }
            }
        }

        private void UpdateFlashers(int phase)
        {
            if (flashingRedLamps == null || flashingRedLamps.Length < 2) return;
            bool stateA = phase % 2 == 0;

            for (int i = 0; i < flashingRedLamps.Length; i++)
            {
                if (flashingRedLamps[i] != null)
                {
                    bool isLampA = (i % 2 == 0);
                    bool on = isLampA ? stateA : !stateA;
                    flashingRedLamps[i].material.SetColor("_EmissionColor", on ? Color.red * 2.5f : Color.black);
                }
            }
        }
    }
}
