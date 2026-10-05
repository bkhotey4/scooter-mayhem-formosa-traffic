using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// Three-treasure Market Grandma (三寶阿嬤) AI:
    /// Leisurely cruising along, blinking right turn signal continuously,
    /// but abruptly cuts left (鬼切左轉) directly in front of the player!
    /// </summary>
    public class MarketGrandmaAI : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float cruiseSpeed = 4.5f; // ~16 km/h
        [SerializeField] private float turnTriggerDistance = 16f;
        [SerializeField] private GameObject rightBlinker;

        private Transform playerTransform;
        private bool isCutLeftTriggered = false;
        private float currentHeadingY = 0f;

        private void Start()
        {
            var player = GameObject.FindGameObjectWithTag("Player");
            if (player != null) playerTransform = player.transform;
            currentHeadingY = transform.rotation.eulerAngles.y;
        }

        private void Update()
        {
            // Blinker permanently blinking right
            if (rightBlinker != null)
            {
                rightBlinker.SetActive((Time.time % 0.4f) < 0.2f);
            }

            if (playerTransform != null)
            {
                float dist = Vector3.Distance(transform.position, playerTransform.position);
                if (!isCutLeftTriggered && dist < turnTriggerDistance)
                {
                    isCutLeftTriggered = true;
                }
            }

            // Cut left sharply
            if (isCutLeftTriggered)
            {
                currentHeadingY = Mathf.LerpAngle(currentHeadingY, currentHeadingY - 70f, Time.deltaTime * 2.2f);
                transform.rotation = Quaternion.Euler(0f, currentHeadingY, 0f);
            }

            // Move forward
            transform.position += transform.forward * (cruiseSpeed * Time.deltaTime);
        }

        private void OnCollisionEnter(Collision collision)
        {
            if (collision.gameObject.CompareTag("Player"))
            {
                var vehicle = collision.gameObject.GetComponentInParent<Vehicle.ScooterVehicleController>();
                if (vehicle != null)
                {
                    vehicle.TriggerCrashWipeout(transform.forward, 12f);
                }
            }
        }
    }
}
